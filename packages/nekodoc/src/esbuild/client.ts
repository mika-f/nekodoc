import path from "path";

import type { BuildOptions } from "esbuild";

import getBuildOptions from "./preset.js";
import { dirname } from "../fs.js";

type EsbuildClientOptions = {
  cacheDir: string;
  mode: "development" | "production";
  watch?: boolean;
};

const createClientConfig = async (
  options: EsbuildClientOptions
): Promise<BuildOptions> => {
  const entries: Record<string, string> = {
    app: path.join(dirname(import.meta.url), "..", "client", "main.tsx"),
  };

  return getBuildOptions({
    bundle: true,
    outdir: path.join(options.cacheDir, "dist", "client"),
    minify: options.mode === "production",
    externals: [],
    write: options.mode === "production",
    watch: options.watch ?? false,
    incremental: false,
    entryPoints: entries,
  });
};

export default createClientConfig;
