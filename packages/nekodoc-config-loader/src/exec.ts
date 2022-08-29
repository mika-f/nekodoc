import * as logger from "@nekodoc/logger";

import type {
  NekoDocConfiguration,
  UserConfigArgs,
} from "@nekodoc/plugin-types";

const exec = async (
  module: any,
  args: UserConfigArgs
): Promise<NekoDocConfiguration> => {
  if (typeof module === "function") {
    try {
      const mod = await module(args);
      return mod as NekoDocConfiguration;
    } catch (e) {
      logger.error("failed to load configuration");
      throw e;
    }
  }

  return module as NekoDocConfiguration;
};

export default exec;
