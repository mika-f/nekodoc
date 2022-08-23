import * as logger from "@nekodoc/logger";

import type { PluginInterface } from "@nekodoc/plugin-types";

const loadPlugin = async (identifier: string): Promise<PluginInterface> => {
  try {
    const module = await import(identifier);
    if (module.default === undefined) throw new Error("");

    return module.default as PluginInterface;
  } catch (err) {
    logger.error(`failed to load plugin: ${identifier}`);
    logger.error(err);

    throw err;
  }
};

export default loadPlugin;
