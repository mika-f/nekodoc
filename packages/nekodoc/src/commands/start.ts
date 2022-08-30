import * as logger from "@nekodoc/logger";
import { getServerRoutings } from "@nekodoc/fs-routing";

import autoprefixer from "autoprefixer";
import fs from "fs/promises";
import mkdirp from "mkdirp";
import { dirname, join, resolve } from "path";
import tailwindcss from "tailwindcss";

import type { NekoDocConfiguration } from "@nekodoc/plugin-types";

import { loadConfig, findConfig } from "../config.js";
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
  configuration: Required<NekoDocConfiguration>,
  logging: boolean
): Promise<Record<string, string>> => {
  if (logging) logger.info("start building client assets");

  const [res, cleanup] = collectJavaScriptsIntoOne({
    components: configuration.markdown.components ?? {},
    layouts: configuration.markdown.layouts ?? {},
  });
  const runtime = context.getBuildRuntime();
  if (runtime === undefined) {
    throw new Error("failed to get build runtime");
  }

  const outputs = await runtime.callback({
    side: "client",
    mode: "development",
    format: "iife",
    dist: join(
      configuration.root,
      configuration.cacheDir,
      runtime.id,
      "client"
    ),
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
  configuration: Required<NekoDocConfiguration>,
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
    dist: join(
      configuration.root,
      configuration.cacheDir,
      runtime.id,
      "server"
    ),
    entry: collectJavaScriptsSeparate({
      components: configuration.markdown.components ?? {},
      layouts: configuration.markdown.layouts ?? {},
    }),
    externals: ["react", "react-dom", "nekodoc"],
    postcssPlugins: [tailwindcss, autoprefixer],
    watch: false,
  });

  if (logging) logger.info("finish building server assets");

  return outputs;
};

const buildAssets = (
  context: PluginInstance,
  configuration: Required<NekoDocConfiguration>,
  logging: boolean
) =>
  Promise.all([
    buildClient(context, configuration, logging),
    buildServer(context, configuration, logging),
  ]);

const getRoutings = (
  configuration: Required<NekoDocConfiguration>
): Promise<Record<string, string>> =>
  getServerRoutings({
    contentDir: join(configuration.root, configuration.contentDir),
    trailingSlash: configuration.markdown.trailingSlash,
  });

const start = async (options: StartCommandOptions): Promise<void> => {
  const opts = { ...options };
  let configuration = await loadConfig(process.cwd(), opts.config, {
    command: "start",
  });

  let routings = await getRoutings(configuration);
  const context = await execute(configuration);

  logger.info("NekoDoc server starting...");

  // auto-refresh configuration
  const configPath = await findConfig(process.cwd(), opts.config);

  logger.info("start compiling initial client/server assets...");

  let [ca, sa] = await buildAssets(context, configuration, false);

  // initial cache
  let cachedServerAssets = {};
  let cachedComponents = {};

  logger.info("finish compiling initial client/server assets");

  const watchings = collectJavaScriptsSeparate({
    components: configuration.markdown.components ?? {},
    layouts: configuration.markdown.layouts ?? {},
  });

  const watcher0 = watcher(Object.values(watchings), async (event) => {
    if (event !== "change") return;

    logger.info("client/server assets has been changed, re-building it");

    [ca, sa] = await buildAssets(context, configuration, true);
  });

  const watcher1 = watcher(configPath, async (event) => {
    if (event !== "change") return;

    logger.info("configuration has been changed, refresh it.");
    configuration = await loadConfig(process.cwd(), opts.config, {
      command: "start",
    });
    routings = await getRoutings(configuration);

    const files = asFiles(watcher0.getWatched());
    watcher0.unwatch(files);

    const newWatchings = collectJavaScriptsSeparate({
      components: configuration.markdown.components ?? {},
      layouts: configuration.markdown.layouts ?? {},
    });

    watcher0.add(Object.values(newWatchings));

    [ca, sa] = await buildAssets(context, configuration, true);
  });

  const watcher2 = watcher(
    join(configuration.root, configuration.contentDir),
    async (event) => {
      if (event === "change") return;

      routings = await getRoutings(configuration);
    }
  );

  await server({
    host: opts.host,
    port: opts.port,
    staticResources: async (path) => {
      const hasContents = Object.keys(ca).includes(path);
      if (hasContents) return ca[path];

      return undefined;
    },
    dynamicResource: async (path) => {
      const hasContents = Object.keys(routings).includes(path);
      if (hasContents) {
        const file = join(
          configuration.root,
          configuration.contentDir,
          routings[path]
        );

        const { frontmatter, mdx } = await transformMarkdown({
          markdown: file,
          rehypePlugins: configuration.markdown.rehypePlugins ?? [],
          remarkPlugins: configuration.markdown.remarkPlugins ?? [],
        });

        const assetNames = Object.keys(ca).map((w) => `/_nekodoc/${w}`);
        const scripts = assetNames.filter((w) => w.endsWith(".js"));
        const stylesheets = assetNames.filter((w) => w.endsWith(".css"));
        let components: Record<string, any> = {};

        if (cachedServerAssets !== sa) {
          const pkg = resolve(
            configuration.root,
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
              configuration.root,
              configuration.cacheDir,
              "dist",
              "server",
              asset
            );

            // eslint-disable-next-line no-await-in-loop
            await fs.unlink(dust);
          }

          // eslint-disable-next-line no-restricted-syntax
          for (const asset of Object.keys(sa)) {
            const write = resolve(
              configuration.root,
              configuration.cacheDir,
              "dist",
              "server",
              asset
            );

            // eslint-disable-next-line no-await-in-loop
            await fs.writeFile(write, sa[asset]);

            // eslint-disable-next-line no-await-in-loop
            const mod = await import(`file://${write}`);
            components[asset.split("-")[0]] = mod.default;
          }

          cachedServerAssets = sa;
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
