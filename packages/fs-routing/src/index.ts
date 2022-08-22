import fs from "fs/promises";
import path from "path";

type RoutingOptions = {
  contentDir: string;
  trailingSlash?: boolean;
};

const getFileNameWithoutExtension = (w: string): string => {
  const url = path.parse(w);
  if (url.dir === "") return url.name;
  if (url.dir === "/") return `/${url.name}`;
  return `${url.dir}/${url.name}`;
};

const getRecursiveGetFiles = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      const internalEntries = await getRecursiveGetFiles(
        `${dir}/${entry.name}`
      );
      files.push(...internalEntries);
    }

    if (entry.isFile()) {
      files.push(`${dir}/${entry.name}`);
    }
  }

  return files;
};

const getServerRoutings = async (
  options: RoutingOptions
): Promise<Record<string, string>> => {
  const routings: Record<string, string> = {};
  const routes = await getRecursiveGetFiles(options.contentDir);

  // eslint-disable-next-line no-restricted-syntax
  for (const route of routes.map((w) =>
    w.replace(`${options.contentDir}/`, "/")
  )) {
    let name = route;

    // path/to/index.mdx? -> path/to/
    if (/index\.mdx?$/.test(name)) {
      name = path.dirname(name);

      if (name !== "/" && options.trailingSlash) {
        name = `${name}/`;
      }
    }

    // path/to/hoge.mdx -> /path/to/hoge or /path/to/hoge/
    if (/\.mdx?$/.test(name)) {
      name = getFileNameWithoutExtension(name);

      if (options.trailingSlash) {
        name = `${name}/`;
      }
    }

    routings[name] = route;
  }

  return routings;
};

const getHtmlRoutings = async (
  options: RoutingOptions
): Promise<Record<string, string>> => {
  const routings: Record<string, string> = {};
  const routes = await getRecursiveGetFiles(options.contentDir);

  // eslint-disable-next-line no-restricted-syntax
  for (const route of routes.map((w) =>
    w.replace(`${options.contentDir}/`, "/")
  )) {
    let name = route;

    // path/to/index.mdx? -> path/to/index.html
    if (/index\.mdx?$/.test(name)) {
      name = path.dirname(name);

      if (name !== "/" && options.trailingSlash) {
        name = `${name}/index.html`;
      }

      if (name === "/") {
        name = "/index.html";
      }
    }

    if (/\.mdx?$/.test(name)) {
      name = getFileNameWithoutExtension(name);

      if (options.trailingSlash) {
        name = `${name}/index.html`;
      } else {
        name = `${name}.html`;
      }
    }

    routings[name] = route;
  }

  return routings;
};

export { getServerRoutings, getHtmlRoutings };
