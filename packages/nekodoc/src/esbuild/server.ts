import path from "path";

import type { BuildOptions } from "esbuild";

import { NekoDocConfiguration } from "../defaults/nekodoc-config.js";
import getBuildOptions from "./preset.js";

const createServerConfig = async (
  configuration: NekoDocConfiguration
): Promise<BuildOptions> => {
  const entries: Record<string, string> = {};
  const options = getBuildOptions({
    bundle: true,
    outdir: path.join(configuration.cacheDir, "dist", "server"),
    minify: false,
    externals: ["react", "react-dom"],
    write: false,
    incremental: false,
    entryPoints: entries,
  });

  return options;
};

export default createServerConfig;
