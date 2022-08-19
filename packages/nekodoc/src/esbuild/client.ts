import path from "path";

import type { BuildOptions } from "esbuild";

import getBuildOptions from "./preset.js";
import { dirname } from "../fs.js";

type EsbuildClientOptions = {
  cacheDir: string;
  mode: "development" | "production";
  watch?: boolean;
  inject?: string[];
};

const createClientConfig = async (
  options: EsbuildClientOptions
): Promise<BuildOptions> => {
  const entries: Record<string, string> = {
    app: path.join(dirname(import.meta.url), "..", "client", "main.tsx"),
  };

  return getBuildOptions({
    format: "iife",
    bundle: true,
    outdir: path.join(options.cacheDir, "dist", "client"),
    minify: options.mode === "production",
    externals: [],
    write: options.mode === "production",
    watch: options.watch ?? false,
    incremental: false,
    entryPoints: entries,
    inject: options.inject,
  });
};

export default createClientConfig;
