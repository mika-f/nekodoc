import postcss from "esbuild-style-plugin";

import type { BuildOptions as EsbuildBuildOptions, Format } from "esbuild";

type BuildOptions = {
  format: Format;
  bundle: boolean;
  outdir: string;
  minify: boolean;
  externals: string[];
  watch: boolean;
  entryPoints: Record<string, string> | string[];
  inject?: string[];
  postcss: any[];
};

const getBuildOptions = (options: BuildOptions): EsbuildBuildOptions => ({
  target: "es2015",
  format: options.format,
  minify: options.minify,
  jsx: "automatic",
  bundle: options.bundle,
  outdir: options.outdir,
  external: options.externals,
  watch: options.watch,
  write: false,
  outExtension: {
    ".js": options.minify ? ".min.js" : ".js",
  },
  entryNames: "[name]-[hash]",
  chunkNames: "[name]-[hash]",
  assetNames: "[name]-[hash]",
  entryPoints: options.entryPoints,
  inject: options.inject ?? [],
  plugins: [
    postcss({
      postcss: {
        plugins: [...options.postcss],
      },
    }),
  ],
});
export default getBuildOptions;
