import * as logger from "@nekodoc/logger";
import { build, BuildOptions, Message } from "esbuild";
import path from "path";

const pickup = (name: string, assets: string[]): string | undefined => {
  const extension = path.extname(name);
  const regex = new RegExp(`^${name}(-.*)?\\${extension}$`);

  // eslint-disable-next-line no-restricted-syntax
  for (const asset of assets) {
    regex.lastIndex = 0;

    if (regex.test(asset)) return asset;
  }

  return undefined;
};

const printMessages = (messages: Message[]): void => {
  // eslint-disable-next-line no-restricted-syntax
  for (const error of messages) {
    const { location } = error;

    if (location) {
      const loc = `${location.file}@${location.line}:${location.column}`;
      logger.error(`esbuild compilation error: ${error.text} at ${loc}`);
    } else {
      logger.error(`esbuild compilation error: ${error.text}`);
    }
  }
};

const transform = async (
  options: BuildOptions
): Promise<Record<string, string>> => {
  const result = await build(options);

  if (result.errors) {
    printMessages(result.errors);
  }

  if (result.warnings) {
    printMessages(result.warnings);
  }

  if (result.outputFiles) {
    const outputs: Record<string, string> = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const file of result.outputFiles) {
      const { path: filename, text } = file;

      const root = `${path.join(process.cwd(), options.outdir!)}\\`;
      outputs[filename.replace(root, "")] = text;
    }

    return outputs;
  }

  return {};
};

export { transform, pickup };
