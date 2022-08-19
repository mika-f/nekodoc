import autoprefixer from "autoprefixer";
import postcss from "esbuild-style-plugin";
import tailwind from "tailwindcss";

import type { BuildOptions as EsbuildBuildOptions, Format } from "esbuild";

type BuildOptions = {
  format: Format;
  bundle: boolean;
  outdir: string;
  minify: boolean;
  externals: string[];
  write: boolean;
  watch: boolean;
  incremental: boolean;
  entryPoints: Record<string, string> | string[];
  inject?: string[];
};

const getBuildOptions = (options: BuildOptions): EsbuildBuildOptions =>
  //
  ({
    target: "es2015",
    format: options.format,
    minify: options.minify,
    jsx: "automatic",
    bundle: options.bundle,
    outdir: options.outdir,
    external: options.externals,
    watch: options.watch,
    write: options.write,
    outExtension: {
      ".js": options.minify ? ".min.js" : ".js",
    },
    entryNames: "[name]-[hash]",
    chunkNames: "[name]-[hash]",
    assetNames: "[name]-[hash]",
    incremental: options.incremental,
    entryPoints: options.entryPoints,
    inject: options.inject ?? [],
    plugins: [
      postcss({
        postcss: {
          plugins: [tailwind, autoprefixer],
        },
      }),
    ],
  });

export default getBuildOptions;
