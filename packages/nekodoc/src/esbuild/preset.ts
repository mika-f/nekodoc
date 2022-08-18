import autoprefixer from "autoprefixer";
import postcss from "esbuild-style-plugin";
import tailwind from "tailwindcss";

import type { BuildOptions as EsbuildBuildOptions } from "esbuild";

type BuildOptions = {
  bundle: boolean;
  outdir: string;
  minify: boolean;
  externals: string[];
  write: boolean;
  incremental: boolean;
  entryPoints: Record<string, string> | string[];
};

const getBuildOptions = (options: BuildOptions): EsbuildBuildOptions =>
  //
  ({
    target: "es2015",
    minify: options.minify,
    jsx: "automatic",
    bundle: options.bundle,
    outdir: options.outdir,
    external: options.externals,
    write: options.write,
    outExtension: {
      ".js": options.minify ? ".min.js" : ".js",
    },
    entryNames: "[name]-[hash]",
    chunkNames: "[name]-[hash]",
    assetNames: "[name]-[hash]",
    incremental: options.incremental,
    entryPoints: options.entryPoints,
    plugins: [
      postcss({
        postcss: {
          plugins: [tailwind, autoprefixer],
        },
      }),
    ],
  });

export default getBuildOptions;
