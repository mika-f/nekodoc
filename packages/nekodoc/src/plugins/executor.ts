import { context, instance, PluginInstance } from "./instance.js";
import loadPlugin from "./loader.js";

import type { NekoDocConfiguration } from "../defaults/nekodoc-config.js";

const execute = async (
  configuration: NekoDocConfiguration
): Promise<PluginInstance> => {
  const { plugins } = configuration;

  // eslint-disable-next-line no-restricted-syntax
  for (const plugin of plugins) {
    // eslint-disable-next-line no-await-in-loop
    const mod = await loadPlugin(plugin);

    mod.load(context);
  }

  return instance;
};

export default execute;
