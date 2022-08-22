import * as logger from "@nekodoc/logger";
import { getHtmlRoutings } from "@nekodoc/fs-routing";
import fs from "fs/promises";
import plimit from "p-limit";
import { dirname, join, resolve } from "path";
import mkdirp from "mkdirp";

import { loadConfig } from "../config.js";
import { NekoDocConfiguration } from "../defaults/nekodoc-config.js";
import {
  collectJavaScriptsIntoOne,
  collectJavaScriptsSeparate,
} from "../javascript/resources.js";
import createClientConfig from "../esbuild/client.js";
import createServerConfig from "../esbuild/server.js";
import { transform } from "../esbuild/transform.js";
import transformMarkdown from "../markdown/transform.js";
import renderAsHtml from "../markdown/renderer.js";

type BuildCommandOptions = {
  config?: string;
  minify?: boolean;
  outDir?: string;
};

const buildClient = async (
  configuration: NekoDocConfiguration
): Promise<Record<string, string>> => {
  const [res, cleanup] = collectJavaScriptsIntoOne({
    components: configuration.components,
    layouts: configuration.layouts,
  });

  const clientConfig = await createClientConfig({
    mode: "production",
    cacheDir: configuration.cacheDir,
    watch: false,
    inject: [res.app],
  });

  const outputs = await transform(clientConfig);
  cleanup();

  return outputs;
};

const buildServer = async (
  configuration: NekoDocConfiguration
): Promise<Record<string, string>> => {
  const serverConfig = await createServerConfig({
    entryPoints: collectJavaScriptsSeparate({
      components: configuration.components,
      layouts: configuration.layouts,
    }),
    cacheDir: configuration.cacheDir,
    watch: false,
  });

  return transform(serverConfig);
};

const build = async (options: BuildCommandOptions): Promise<void> => {
  const opts = { outDir: "./dist", ...options };
  const configuration = await loadConfig(process.cwd(), opts.config);
  const routings = await getHtmlRoutings({ ...configuration });

  logger.info("start building static website...");

  const [clientAssets, serverAssets] = await Promise.all([
    buildClient(configuration),
    buildServer(configuration),
  ]);

  const pkg = resolve(configuration.cacheDir, "dist", "server", "package.json");
  await mkdirp(dirname(pkg));

  await fs.writeFile(pkg, JSON.stringify({ type: "module" }));

  const components: Record<string, any> = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const asset of Object.keys(serverAssets)) {
    const write = resolve(configuration.cacheDir, "dist", "server", asset);

    // eslint-disable-next-line no-await-in-loop
    await fs.writeFile(write, serverAssets[asset]);

    // eslint-disable-next-line no-await-in-loop
    const mod = await import(`file://${write}`);
    components[asset.split("-")[0]] = mod.default;
  }

  console.log(clientAssets);

  const assetNames = Object.keys(clientAssets).map((w) => `/_nekodoc/${w}`);
  const scripts = assetNames.filter((w) => w.endsWith(".js"));
  const stylesheets = assetNames.filter((w) => w.endsWith(".css"));
  const limit = plimit(10);
  const pages = Object.keys(routings).map((w) => {
    logger.info(`output routing '${w}' by ${routings[w]}`);

    return limit(async () => {
      const file = join(configuration.contentDir, routings[w]);
      const { frontmatter, mdx } = await transformMarkdown({
        markdown: file,
        rehypePlugins: configuration.rehypePlugins,
        remarkPlugins: configuration.remarkPlugins,
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

  await mkdirp(resolve(process.cwd(), opts.outDir));

  // eslint-disable-next-line no-restricted-syntax
  for (const html of htmls) {
    const path = resolve(process.cwd(), opts.outDir, html.route.substring(1));

    // eslint-disable-next-line no-await-in-loop
    await mkdirp(dirname(path));
    // eslint-disable-next-line no-await-in-loop
    await fs.writeFile(path, html.html);
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const asset of Object.keys(clientAssets)) {
    const path = resolve(process.cwd(), opts.outDir, "_nekodoc", asset);

    // eslint-disable-next-line no-await-in-loop
    await mkdirp(dirname(path));
    // eslint-disable-next-line no-await-in-loop
    await fs.writeFile(path, clientAssets[asset]);
  }

  logger.success("build successful");
};

export default build;
