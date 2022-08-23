import fs from "fs/promises";
import path from "path";

const isFileExists = async (file: string): Promise<boolean> => {
  try {
    return (await fs.stat(file)).isFile();
  } catch {
    return false;
  }
};

/**
 * dirname for import.meta
 * @param url
 * @returns
 */
const dirname = (url: string): string => {
  let { pathname } = new URL(url);

  if (process.platform === "win32") {
    pathname = pathname.substring(1);
  }

  return path.dirname(pathname);
};

export { isFileExists, dirname };
