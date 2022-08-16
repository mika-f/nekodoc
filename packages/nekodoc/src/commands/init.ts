import * as fs from "fs/promises";
import * as logger from "@nekodoc/logger";

import {
  DEFAULT as NekoDocJs,
  HEADER as NekoDocHeader,
} from "../defaults/nekodoc-config.js";
import {
  DEFAULT as TailwindJs,
  HEADER as TailwindHeader,
} from "../defaults/tailwindcss.js";
import { isFileExists } from "../fs.js";

type Configuration = Record<string, { header: string; content: unknown }>;

const CONFIGURATIONS: Configuration = {
  "nekodoc.config.js": {
    header: NekoDocHeader,
    content: NekoDocJs,
  },
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
