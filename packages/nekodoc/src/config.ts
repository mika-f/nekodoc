import { isFileExists } from "@nekodoc/fs-utils";
import * as logger from "@nekodoc/logger";
import importFresh from "import-fresh";
import path from "path";

import type { NekoDocConfiguration } from "./defaults/nekodoc-config";

const DEFAULT_CONFIG = "nekodoc.config";

const findConfig = async (dir: string): Promise<string> => {
  const candidates = [".js", ".mjs"].map((w) => `${DEFAULT_CONFIG}${w}`);

  // eslint-disable-next-line no-restricted-syntax
  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const isExists = await isFileExists(path.join(dir, candidate));
    if (isExists) return path.join(dir, candidate);
  }

  logger.error(`unable to find ${DEFAULT_CONFIG}.(js|mjs)`);
  throw new Error();
};

const loadConfig = async (
  dir: string,
  customPath?: string
): Promise<NekoDocConfiguration> => {
  const configPath = customPath
    ? path.resolve(dir, customPath)
    : await findConfig(dir);
  const isExists = await isFileExists(configPath);
  if (!isExists) {
    logger.error(`unable to find ${configPath}`);
    throw new Error();
  }

  // todo: validate configuration javascript -> how?
  const config = importFresh(configPath) as NekoDocConfiguration;
  config.plugins = ["@nekodoc/plugin-esbuild", ...config.plugins];
  return { ...config };
};

export { findConfig, loadConfig };
