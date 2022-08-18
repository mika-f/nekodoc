import path from "path";

import type { BuildOptions } from "esbuild";

import { NekoDocConfiguration } from "../defaults/nekodoc-config.js";
import getBuildOptions from "./preset.js";
import { dirname } from "../fs.js";

const createClientConfig = async (
  configuration: NekoDocConfiguration
): Promise<BuildOptions> => {
  const entries: Record<string, string> = {
    app: path.join(dirname(import.meta.url), "..", "client", "main.tsx"),
  };

  const options = getBuildOptions({
    bundle: true,
    outdir: path.join(configuration.cacheDir, "dist", "client"),
    minify: false,
    externals: [],
    write: false,
    incremental: false,
    entryPoints: entries,
  });

  return options;
};

export default createClientConfig;
