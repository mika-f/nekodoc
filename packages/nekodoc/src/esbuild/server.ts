import path from "path";

import type { BuildOptions } from "esbuild";

import getBuildOptions from "./preset.js";

type EsbuildServerOptions = {
  entryPoints: Record<string, string>;
  cacheDir: string;
  watch?: boolean;
};

const createServerConfig = async (
  options: EsbuildServerOptions
): Promise<BuildOptions> =>
  getBuildOptions({
    format: "esm",
    bundle: true,
    outdir: path.join(options.cacheDir, "dist", "server"),
    minify: false,
    externals: ["react", "react-dom"],
    write: false,
    watch: options.watch ?? false,
    incremental: false,
    entryPoints: options.entryPoints,
  });

export default createServerConfig;
