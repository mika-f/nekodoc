import * as logger from "@nekodoc/logger";
import { join } from "path";

import { findConfig, loadConfig } from "../config.js";
import { NekoDocConfiguration } from "../defaults/nekodoc-config.js";
import createClientConfig from "../esbuild/client.js";
import { transform } from "../esbuild/transform.js";
import renderAsHtml from "../markdown/renderer.js";
import transformMarkdown from "../markdown/transform.js";
import server from "../server/index.js";
import getRoutings from "../server/routes.js";
import watcher from "../server/watch.js";

type StartCommandOptions = {
  port?: number;
  host?: string;
  config?: string;
  minify?: boolean;
};

const build = async (
  configuration: NekoDocConfiguration,
  onRebuild: (outputs: Record<string, string>) => void
): Promise<Record<string, string>> => {
  const client = await createClientConfig({
    mode: "development",
    cacheDir: configuration.cacheDir,
    watch: true,
  });

  logger.info("start initial compiling client assets...");

  const outputs = await transform(client, onRebuild);

  logger.info("finish initial compiling client assets");

  return outputs;
};

const start = async (options: StartCommandOptions): Promise<void> => {
  const opts = { ...options };
  let configuration = await loadConfig(process.cwd(), opts.config);
  let routings = await getRoutings({ ...configuration });

  // auto-refresh configuration
  const configPath = await findConfig(process.cwd());
  const watcher1 = watcher(configPath, async (event) => {
    if (event !== "change") return;

    logger.info("configuration has been changed, refresh it.");
    configuration = await loadConfig(process.cwd(), opts.config);
    routings = await getRoutings({ ...configuration });
  });

  const watcher2 = watcher(configuration.contentDir, async (event) => {
    if (event === "change") return;

    routings = await getRoutings({ ...configuration });
  });

  let assets = await build(configuration, (outputs) => {
    logger.info("finish re-building client assets");
    assets = outputs;
  });

  await server({
    host: opts.host,
    port: opts.port,
    staticResources: async (path) => {
      const hasContents = Object.keys(assets).includes(path);
      if (hasContents) return assets[path];

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

        const assetNames = Object.keys(assets).map((w) => `/_nekodoc/${w}`);
        const scripts = assetNames.filter((w) => w.endsWith(".js"));
        const stylesheets = assetNames.filter((w) => w.endsWith(".css"));

        return renderAsHtml({
          scripts,
          stylesheets,
          frontmatter,
          mdx,
          components: {},
        });
      }

      return `${hasContents}`;
    },
    onClose: () => {
      watcher1.close();
      watcher2.close();
    },
  });
};

export default start;
