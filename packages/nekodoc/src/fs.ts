import fs from "fs/promises";

const isFileExists = async (file: string): Promise<boolean> => {
  try {
    return (await fs.stat(file)).isFile();
  } catch {
    return false;
  }
};

export { isFileExists };
