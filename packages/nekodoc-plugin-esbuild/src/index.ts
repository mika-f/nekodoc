import * as logger from "@nekodoc/logger";
import { build } from "esbuild";
import path from "path";

import type {
  Assets,
  PluginInterface,
  TransformOptions,
} from "@nekodoc/plugin-types";
import type { BuildOptions, BuildResult, Message } from "esbuild";

import createClientConfig from "./client.js";
import createServerConfig from "./server.js";

const printMessages = (messages: Message[]): void => {
  // eslint-disable-next-line no-restricted-syntax
  for (const error of messages) {
    const { location } = error;

    if (location) {
      const loc = `${location.file}@${location.line}:${location.column}`;
      logger.error(`[esbuild] compilation error: ${error.text} at ${loc}`);
    } else {
      logger.error(`[esbuild] compilation error: ${error.text}`);
    }
  }
};

const getOptions = (options: TransformOptions): BuildOptions => {
  if (options.side === "client") {
    return createClientConfig(options);
  }

  return createServerConfig(options);
};

const transform = async (
  options: TransformOptions,
  onRebuild?: (outputs: Assets) => void
): Promise<Assets> => {
  const collect = (result: BuildResult) => {
    if (result.outputFiles) {
      const outputs: Record<string, string> = {};

      // eslint-disable-next-line no-restricted-syntax
      for (const file of result.outputFiles) {
        const { path: filename, text } = file;

        const root = `${options.dist!}${path.sep}`;
        outputs[filename.replace(root, "")] = text;
      }

      return outputs;
    }

    return {};
  };

  const isWatchMode = !!options.watch;
  const opts: BuildOptions = {
    ...getOptions(options),
    watch: isWatchMode
      ? {
          onRebuild: (err, result) => {
            if (err) {
              if (err.errors) printMessages(err.errors);
              if (err.warnings) printMessages(err.warnings);

              return;
            }

            if (result) {
              const outputs = collect(result);
              if (onRebuild) onRebuild(outputs);
            }
          },
        }
      : false,
  };

  const result = await build(opts);

  if (result.errors) {
    printMessages(result.errors);
  }

  if (result.warnings) {
    printMessages(result.warnings);
  }

  return collect(result);
};

const plugin: PluginInterface = {
  load(context) {
    context.registerTransformer("esbuild", (options) => transform(options));
  },
};

export default plugin;
