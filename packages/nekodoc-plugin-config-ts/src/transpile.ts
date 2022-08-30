import { build } from "esbuild";
import { dirname } from "path";

const transpileEsm = async (path: string): Promise<string | undefined> => {
  const result = await build({
    target: "node16",
    platform: "node",
    format: "esm",
    minify: false,
    bundle: true,
    write: false,
    define: { "import.meta.url": JSON.stringify(`file://${path}`) },
    entryPoints: { app: path },
  });

  return result.outputFiles.find((w) => w.path.endsWith("<stdout>"))?.text;
};

const transpileCjs = async (path: string): Promise<string | undefined> => {
  const result = await build({
    target: "node16",
    platform: "node",
    format: "cjs",
    minify: false,
    bundle: true,
    write: false,
    define: { __dirname: JSON.stringify(dirname(path)) },
    entryPoints: { app: path },
  });

  return result.outputFiles.find((w) => w.path.endsWith("<stdout>"))?.text;
};

export { transpileCjs, transpileEsm };
