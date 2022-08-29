import {
  DEFAULT_CONFIGURATION,
  exec,
  load,
  find,
  merge,
} from "@nekodoc/config-loader";

import type {
  NekoDocConfiguration,
  UserConfigArgs,
} from "@nekodoc/plugin-types";

const loadConfig = async (
  dir: string,
  customPath: string | undefined,
  args: UserConfigArgs
): Promise<Required<NekoDocConfiguration>> => {
  const mod = await load(dir, customPath);
  const userConfig = await exec(mod, args);

  return merge([
    DEFAULT_CONFIGURATION,
    userConfig,
  ]) as Required<NekoDocConfiguration>;
};

const findConfig = (dir: string, customPath?: string) => find(dir, customPath);

export { loadConfig, findConfig };
