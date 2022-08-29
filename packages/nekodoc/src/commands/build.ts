import * as logger from "@nekodoc/logger";
import { getHtmlRoutings } from "@nekodoc/fs-routing";

import type { NekoDocConfiguration } from "@nekodoc/plugin-types";

import autoprefixer from "autoprefixer";
import fs from "fs/promises";
import plimit from "p-limit";
import { dirname, join, resolve } from "path";
import mkdirp from "mkdirp";
import tailwindcss from "tailwindcss";

import { loadConfig } from "../config.js";
import {
  collectJavaScriptsIntoOne,
  collectJavaScriptsSeparate,
} from "../javascript/resources.js";
import transformMarkdown from "../markdown/transform.js";
import renderAsHtml from "../markdown/renderer.js";
import execute from "../plugins/executor.js";

import type { PluginInstance } from "../plugins/instance.js";

type BuildCommandOptions = {
  config?: string;
  minify?: boolean;
  outDir?: string;
};

const buildClient = async (
  context: PluginInstance,
  configuration: Required<NekoDocConfiguration>
): Promise<Record<string, string>> => {
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
    mode: "production",
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

  cleanup();

  return outputs;
};

const buildServer = async (
  context: PluginInstance,
  configuration: Required<NekoDocConfiguration>
): Promise<Record<string, string>> => {
  const runtime = context.getBuildRuntime();
  if (runtime === undefined) throw new Error("failed to get build runtime");

  const outputs = await runtime.callback({
    side: "server",
    mode: "production",
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

  return outputs;
};

const build = async (options: BuildCommandOptions): Promise<void> => {
  const opts = { outDir: "./dist", ...options };
  const configuration = await loadConfig(process.cwd(), opts.config, {
    command: "build",
  });
  const routings = await getHtmlRoutings({
    contentDir: join(configuration.root, configuration.contentDir),
    trailingSlash: configuration.markdown?.trailingSlash,
  });
  const context = await execute(configuration);

  logger.info("start building static website...");

  const [clientAssets, serverAssets] = await Promise.all([
    buildClient(context, configuration),
    buildServer(context, configuration),
  ]);

  const pkg = resolve(
    configuration.root,
    configuration.cacheDir,
    "dist",
    "server",
    "package.json"
  );
  await mkdirp(dirname(pkg));

  await fs.writeFile(pkg, JSON.stringify({ type: "module" }));

  const components: Record<string, any> = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const asset of Object.keys(serverAssets)) {
    const write = resolve(
      configuration.root,
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

  const assetNames = Object.keys(clientAssets).map((w) => `/_nekodoc/${w}`);
  const scripts = assetNames.filter((w) => w.endsWith(".js"));
  const stylesheets = assetNames.filter((w) => w.endsWith(".css"));
  const limit = plimit(10);
  const pages = Object.keys(routings).map((w) => {
    logger.info(`output routing '${w}' by ${routings[w]}`);

    return limit(async () => {
      const file = join(
        configuration.root,
        configuration.contentDir,
        routings[w]
      );
      const { frontmatter, mdx } = await transformMarkdown({
        markdown: file,
        rehypePlugins: configuration.markdown.rehypePlugins ?? [],
        remarkPlugins: configuration.markdown.remarkPlugins ?? [],
      });

      return {
        html: await renderAsHtml({
          scripts,
          stylesheets,
          frontmatter,
          mdx,
          components,
        }),
        route: w,
      };
    });
  });

  const htmls = await Promise.all(pages);

  await mkdirp(resolve(configuration.root, opts.outDir));

  // eslint-disable-next-line no-restricted-syntax
  for (const html of htmls) {
    const path = resolve(
      configuration.root,
      opts.outDir,
      html.route.substring(1)
    );

    // eslint-disable-next-line no-await-in-loop
    await mkdirp(dirname(path));
    // eslint-disable-next-line no-await-in-loop
    await fs.writeFile(path, html.html);
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const asset of Object.keys(clientAssets)) {
    const path = resolve(configuration.root, opts.outDir, "_nekodoc", asset);

    // eslint-disable-next-line no-await-in-loop
    await mkdirp(dirname(path));
    // eslint-disable-next-line no-await-in-loop
    await fs.writeFile(path, clientAssets[asset]);
  }

  logger.success("build successful");
};

export default build;
