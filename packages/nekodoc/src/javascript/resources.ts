import { dirname } from "@nekodoc/fs-utils";
import fs from "fs/promises";
import path from "path";
import tmp from "tmp";

type ResourcesOptions = {
  components: Record<string, string>;
  layouts: Record<string, string>;
};

const normalize = (w: string): string =>
  path.normalize(w).split(/[\\/]/g).join(path.posix.sep);

const collectJavaScriptsSeparate = (
  options: ResourcesOptions
): Record<string, string> => {
  const resources: Record<string, string> = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const asset of Object.keys(options.components)) {
    resources[asset] = options.components[asset];
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const asset of Object.keys(options.layouts)) {
    resources[asset] = options.layouts[asset];
  }

  return resources;
};

const collectJavaScriptsIntoOne = (
  options: ResourcesOptions
): [Record<string, string>, () => void] => {
  const lines: string[] = [];
  const exports: string[] = [];
  const main = normalize(
    path.resolve(
      path.join(dirname(import.meta.url), "..", "client", "main.tsx")
    )
  );

  lines.push(`import run from "${main}";`);

  // eslint-disable-next-line no-restricted-syntax
  for (const asset of Object.keys(options.components)) {
    lines.push(
      `import ${asset} from "${normalize(options.components[asset])}";`
    );
    exports.push(`    ${asset}`);
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const asset of Object.keys(options.layouts)) {
    lines.push(`import ${asset} from "${normalize(options.layouts[asset])}";`);
    exports.push(`    ${asset}`);
  }

  const imports = tmp.fileSync({ postfix: "globalImports.ts" });
  const cleanup = () => imports.removeCallback();
  const globalImports = `
${lines.join("\n")};

window.__NEKODOC_COMPONENTS__ = {
${exports.join(",\n")}
};

run();
  `;

  fs.writeFile(imports.name, globalImports);

  return [{ app: imports.name }, cleanup];
};

export { collectJavaScriptsIntoOne, collectJavaScriptsSeparate };
