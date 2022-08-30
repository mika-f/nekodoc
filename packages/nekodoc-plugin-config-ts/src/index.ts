import { isFileExists } from "@nekodoc/fs-utils";
import findup from "findup-sync";
import importFresh from "import-fresh";
import fs from "fs/promises";
import path from "path";
import tmp from "tmp";

import { transpileCjs, transpileEsm } from "./transpile.js";

const DEFAULT_CONFIG = "nekodoc.config";

const container = async <T>(
  type: "commonjs" | "esm",
  transpile: () => Promise<string | undefined>,
  req: (w: string) => Promise<T>
): Promise<T | undefined> => {
  const f = tmp.fileSync({
    postfix: type === "esm" ? "nekodoc-config-ts.mjs" : "nekodoc-config-ts.js",
  });
  const module = await transpile();

  if (module === undefined) return undefined;

  await fs.writeFile(f.name, module);

  const mod = await req(f.name);

  f.removeCallback();

  return mod;
};

const findTsConfig = async (
  dir: string,
  customPath?: string
): Promise<string | undefined> => {
  if (customPath) {
    return path.resolve(dir, customPath);
  }

  const candidates = [".ts", ".mts", ".cts"].map(
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

  return undefined;
};

const loadTsConfig = async (dir: string, customPath?: string): Promise<any> => {
  const cfgPath = await findTsConfig(dir, customPath);
  if (cfgPath === undefined) {
    return undefined;
  }

  const isExists = await isFileExists(cfgPath);
  if (isExists) {
    const pkg = findup("package.json");
    let isESM = false;

    if (pkg) {
      try {
        const json = await fs.readFile(pkg);
        isESM =
          (!!pkg && JSON.parse(json.toString()).type === "module") ||
          cfgPath.endsWith(".mts");
      } catch (e) {
        // ignored
      }
    }

    if (isESM) {
      const mod = await container(
        "esm",
        () => transpileEsm(cfgPath),
        (w) => import(`file://${w}`)
      );

      return mod?.default;
      // eslint-disable-next-line no-else-return
    } else {
      const mod = await container(
        "commonjs",
        () => transpileCjs(cfgPath),
        (w) => Promise.resolve(importFresh(w))
      );

      return (mod as any | undefined)?.default;
    }
  }

  return undefined;
};

export { findTsConfig, loadTsConfig };
