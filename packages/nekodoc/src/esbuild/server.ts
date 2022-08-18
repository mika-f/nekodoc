import path from "path";

import type { BuildOptions } from "esbuild";

import getBuildOptions from "./preset.js";

type EsbuildServerOptions = {
  cacheDir: string;
  watch?: boolean;
};

const createServerConfig = async (
  options: EsbuildServerOptions
): Promise<BuildOptions> => {
  const entries: Record<string, string> = {};

  return getBuildOptions({
    bundle: true,
    outdir: path.join(options.cacheDir, "dist", "server"),
    minify: false,
    externals: ["react", "react-dom"],
    write: false,
    watch: options.watch ?? false,
    incremental: false,
    entryPoints: entries,
  });
};

export default createServerConfig;
