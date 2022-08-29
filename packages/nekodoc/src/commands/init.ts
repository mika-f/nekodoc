import { isFileExists } from "@nekodoc/fs-utils";
import * as logger from "@nekodoc/logger";
import * as fs from "fs/promises";

import {
  DEFAULT as TailwindJs,
  HEADER as TailwindHeader,
} from "../defaults/tailwindcss.js";

type Configuration = Record<string, { header: string; content: unknown }>;

const CONFIGURATIONS: Configuration = {
  "tailwind.config.js": {
    header: TailwindHeader,
    content: TailwindJs,
  },
};

const init = async (): Promise<void> => {
  const promises = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const configuration of Object.keys(CONFIGURATIONS)) {
    promises.push(
      (async () => {
        const isAlreadyExists = await isFileExists(configuration);
        if (isAlreadyExists) {
          logger.warn(`${configuration} is already exists`);
          return;
        }

        const { header, content } = CONFIGURATIONS[configuration];
        const w = `${header}\nmodule.exports = ${JSON.stringify(
          content,
          null,
          2
        )}`;

        await fs.writeFile(configuration, w);
      })()
    );
  }

  await Promise.all(promises);

  logger.success("create configurations successfully");
};

export default init;
