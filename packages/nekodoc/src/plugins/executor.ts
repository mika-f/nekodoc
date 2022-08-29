import type { NekoDocConfiguration } from "@nekodoc/plugin-types";

import { context, instance, PluginInstance } from "./instance.js";
import loadPlugin from "./loader.js";

const execute = async (
  configuration: Required<NekoDocConfiguration>
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
