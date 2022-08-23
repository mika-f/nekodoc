import type { TransformOptions } from "@nekodoc/plugin-types";
import type { BuildOptions } from "esbuild";

import getBuildOptions from "./preset.js";

const createServerConfig = (options: TransformOptions): BuildOptions =>
  getBuildOptions({
    format: options.format,
    bundle: true,
    outdir: options.dist,
    minify: false,
    externals: options.externals,
    watch: options.watch ?? false,
    entryPoints: options.entry,
    postcss: options.postcssPlugins,
  });

export default createServerConfig;
