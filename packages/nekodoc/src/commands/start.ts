import * as logger from "@nekodoc/logger";
import { getServerRoutings } from "@nekodoc/fs-routing";

import autoprefixer from "autoprefixer";
import fs from "fs/promises";
import mkdirp from "mkdirp";
import { dirname, join, resolve } from "path";
import tailwindcss from "tailwindcss";

import { findConfig, loadConfig } from "../config.js";
import { NekoDocConfiguration } from "../defaults/nekodoc-config.js";
import {
  collectJavaScriptsIntoOne,
  collectJavaScriptsSeparate,
} from "../javascript/resources.js";
import renderAsHtml from "../markdown/renderer.js";
import transformMarkdown from "../markdown/transform.js";
import server from "../server/index.js";
import watcher from "../server/watch.js";
import execute from "../plugins/executor.js";

import type { PluginInstance } from "../plugins/instance.js";

type StartCommandOptions = {
  port?: number;
  host?: string;
  config?: string;
  minify?: boolean;
};

const asFiles = (obj: { [dict: string]: string[] }): string[] => {
  const files: string[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const dir of Object.keys(obj)) {
    const o = obj[dir]; // workaround for invalid prettier formatting

    // eslint-disable-next-line no-restricted-syntax
    for (const file of o) {
      files.push(join(dir, file));
    }
  }

  return files;
};

const buildClient = async (
  context: PluginInstance,
  configuration: NekoDocConfiguration,
  logging: boolean
): Promise<Record<string, string>> => {
  if (logging) logger.info("start building client assets");

  const [res, cleanup] = collectJavaScriptsIntoOne({
    components: configuration.components,
    layouts: configuration.layouts,
  });
  const runtime = context.getBuildRuntime();
  if (runtime === undefined) {
    throw new Error("failed to get build runtime");
  }

  const outputs = await runtime.callback({
    side: "client",
    mode: "development",
    format: "iife",
    dist: join(configuration.cacheDir, runtime.id, "client"),
    entry: { app: res.app },
    externals: [],
    postcssPlugins: [tailwindcss, autoprefixer],
    watch: false,
  });

  if (logging) logger.info("finish building client assets");

  cleanup();

  return outputs;
};

const buildServer = async (
  context: PluginInstance,
  configuration: NekoDocConfiguration,
  logging: boolean
) => {
  if (logging) logger.info("start building server assets");

  const runtime = context.getBuildRuntime();
  if (runtime === undefined) {
    throw new Error("failed to get build runtime");
  }

  const outputs = await runtime.callback({
    side: "server",
    mode: "development",
    format: "esm",
    dist: join(configuration.cacheDir, runtime.id, "server"),
    entry: collectJavaScriptsSeparate({
      components: configuration.components,
      layouts: configuration.layouts,
    }),
    externals: ["react", "react-dom", "nekodoc"],
    postcssPlugins: [tailwindcss, autoprefixer],
    watch: false,
  });

  if (logging) logger.info("finish building server assets");

  return outputs;
};

const start = async (options: StartCommandOptions): Promise<void> => {
  const opts = { ...options };
  let configuration = await loadConfig(process.cwd(), opts.config);
  let routings = await getServerRoutings({ ...configuration });

  const context = await execute(configuration);

  logger.info("NekoDoc server starting...");

  // auto-refresh configuration
  const configPath = await findConfig(process.cwd());

  logger.info("start compiling initial client/server assets...");

  let [clientAssets, serverAssets] = await Promise.all([
    buildClient(context, configuration, false),
    buildServer(context, configuration, false),
  ]);

  // initial cache
  let cachedServerAssets = {};
  let cachedComponents = {};

  logger.info("finish compiling initial client/server assets");

  const watchings = collectJavaScriptsSeparate({
    components: configuration.components,
    layouts: configuration.layouts,
  });

  const watcher0 = watcher(Object.values(watchings), async (event) => {
    if (event !== "change") return;

    logger.info("client/server assets has been changed, re-building it");

    const [ca, sa] = await Promise.all([
      buildClient(context, configuration, true),
      buildServer(context, configuration, true),
    ]);

    clientAssets = ca;
    serverAssets = sa;
  });

  const watcher1 = watcher(configPath, async (event) => {
    if (event !== "change") return;

    logger.info("configuration has been changed, refresh it.");
    configuration = await loadConfig(process.cwd(), opts.config);
    routings = await getServerRoutings({ ...configuration });

    const files = asFiles(watcher0.getWatched());
    watcher0.unwatch(files);

    const newWatchings = collectJavaScriptsSeparate({
      components: configuration.components,
      layouts: configuration.layouts,
    });

    watcher0.add(Object.values(newWatchings));

    const [ca, sa] = await Promise.all([
      buildClient(context, configuration, true),
      buildServer(context, configuration, true),
    ]);

    clientAssets = ca;
    serverAssets = sa;
  });

  const watcher2 = watcher(configuration.contentDir, async (event) => {
    if (event === "change") return;

    routings = await getServerRoutings({ ...configuration });
  });

  await server({
    host: opts.host,
    port: opts.port,
    staticResources: async (path) => {
      const hasContents = Object.keys(clientAssets).includes(path);
      if (hasContents) return clientAssets[path];

      return undefined;
    },
    dynamicResource: async (path) => {
      const hasContents = Object.keys(routings).includes(path);
      if (hasContents) {
        const file = join(configuration.contentDir, routings[path]);

        const { frontmatter, mdx } = await transformMarkdown({
          markdown: file,
          rehypePlugins: configuration.rehypePlugins,
          remarkPlugins: configuration.remarkPlugins,
        });

        const assetNames = Object.keys(clientAssets).map(
          (w) => `/_nekodoc/${w}`
        );
        const scripts = assetNames.filter((w) => w.endsWith(".js"));
        const stylesheets = assetNames.filter((w) => w.endsWith(".css"));
        let components: Record<string, any> = {};

        if (cachedServerAssets !== serverAssets) {
          const pkg = resolve(
            configuration.cacheDir,
            "dist",
            "server",
            "package.json"
          );

          await mkdirp(dirname(pkg));

          await fs.writeFile(pkg, JSON.stringify({ type: "module" }));

          // eslint-disable-next-line no-restricted-syntax
          for (const asset of Object.keys(cachedServerAssets)) {
            const dust = resolve(
              configuration.cacheDir,
              "dist",
              "server",
              asset
            );

            // eslint-disable-next-line no-await-in-loop
            await fs.unlink(dust);
          }

          // eslint-disable-next-line no-restricted-syntax
          for (const asset of Object.keys(serverAssets)) {
            const write = resolve(
              configuration.cacheDir,
              "dist",
              "server",
              asset
            );

            // eslint-disable-next-line no-await-in-loop
            await fs.writeFile(write, serverAssets[asset]);

            // eslint-disable-next-line no-await-in-loop
            const mod = await import(`file://${write}`);
            components[asset.split("-")[0]] = mod.default;
          }

          cachedServerAssets = serverAssets;
          cachedComponents = components;
        } else {
          components = cachedComponents;
        }

        return renderAsHtml({
          scripts,
          stylesheets,
          frontmatter,
          mdx,
          components,
        });
      }

      return `${hasContents}`;
    },
    onClose: () => {
      watcher0.close();
      watcher1.close();
      watcher2.close();
    },
  });
};

export default start;
