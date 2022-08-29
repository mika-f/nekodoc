import { isFileExists } from "@nekodoc/fs-utils";
import * as logger from "@nekodoc/logger";
import findup from "findup-sync";
import fs from "fs/promises";
import importFresh from "import-fresh";
import path from "path";

import type { NekoDocConfiguration } from "@nekodoc/plugin-types";

const DEFAULT_CONFIG = "nekodoc.config";
const NEKODOC_TS_SUPPORT_PLUGIN = "@nekodoc/plugin-config-ts";

const isSupportTypeScript = async (): Promise<boolean> => {
  try {
    await import(NEKODOC_TS_SUPPORT_PLUGIN);
    return true;
  } catch (e) {
    return false;
  }
};

const findJsConfig = async (
  dir: string,
  customPath?: string
): Promise<string> => {
  if (customPath) {
    return path.resolve(dir, customPath);
  }

  const candidates = [".js", ".mjs", ".cjs"].map(
    (w) => `${DEFAULT_CONFIG}${w}`
  );

  // eslint-disable-next-line no-restricted-syntax
  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const isExists = await isFileExists(path.join(dir, candidate));
    if (isExists) {
      return path.join(dir, candidate);
    }
  }

  logger.error(`unable to find ${DEFAULT_CONFIG}.{js,mjs,cjs}`);
  throw new Error();
};

const loadJsConfig = async (dir: string, customPath?: string): Promise<any> => {
  const cfgPath = await findJsConfig(dir, customPath);
  const isExists = await isFileExists(cfgPath);
  if (isExists) {
    const pkg = findup("package.json");
    let isESM = false;

    if (pkg) {
      try {
        const json = await fs.readFile(pkg);
        isESM =
          (!!pkg && JSON.parse(json.toString()).type === "module") ||
          cfgPath.endsWith(".mjs");
      } catch (e) {
        // ignored
      }
    }

    if (isESM) {
      const mod = await import(`file://${cfgPath}`);
      return mod.default;
    }

    const mod = importFresh(cfgPath) as NekoDocConfiguration;
    return mod;
  }

  logger.error(`unable to find ${cfgPath}`);
  throw new Error();
};

const findTsConfig = async (
  dir: string,
  customPath?: string
): Promise<string> => {
  const mod = await import(NEKODOC_TS_SUPPORT_PLUGIN);
  return mod.findTsConfig(dir, customPath);
};

const loadTsConfig = async (dir: string, customPath?: string): Promise<any> => {
  const mod = await import(NEKODOC_TS_SUPPORT_PLUGIN);
  return mod.loadTsConfig(dir, customPath);
};

const load = async (dir: string, customPath?: string): Promise<any> => {
  const hasTsSupportModule = await isSupportTypeScript();
  if (hasTsSupportModule) {
    return loadTsConfig(dir, customPath) ?? loadJsConfig(dir, customPath);
  }

  return loadJsConfig(dir, customPath);
};

const find = async (dir: string, customPath?: string): Promise<string> => {
  const hasTsSupportModule = await isSupportTypeScript();
  if (hasTsSupportModule) {
    return findTsConfig(dir, customPath) ?? findJsConfig(dir, customPath);
  }

  return findJsConfig(dir, customPath);
};

export { load, find };
