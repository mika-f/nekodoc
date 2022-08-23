import type {
  Assets,
  BuildEventArgs,
  PluginContext,
  TransformOptions,
} from "@nekodoc/plugin-types";

type BuildEvent = {
  event: "build";
  callback: (args: BuildEventArgs) => void;
};

type PluginStore = {
  builder:
    | {
        id: string;
        callback: (args: TransformOptions) => Promise<Assets>;
      }
    | undefined;
  hooks: (BuildEvent | BuildEvent)[];
};

const store: PluginStore = {
  builder: undefined,
  hooks: [],
};

const context: PluginContext = {
  registerTransformer(id, callback) {
    store.builder = { id, callback };
  },
  registerHook(event, callback) {
    store.hooks.push({ event, callback });
  },
};

const instance = {
  getBuildRuntime() {
    return store.builder;
  },
} as const;

type PluginInstance = typeof instance;

export { context, instance };
export type { PluginInstance };
