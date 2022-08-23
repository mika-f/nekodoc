export type Assets = Record<string, string>;

export type TransformOptions = {
  side: "client" | "server";
  mode: "development" | "production";
  format: "esm" | "iife";
  dist: string;
  entry: Assets;
  externals: string[];
  postcssPlugins: any[];
  watch?: boolean;
  onRebuild?: (assets: Assets) => void;
};

export type BuildEventArgs = {};

export type PluginContext = {
  registerTransformer(
    id: string,
    callback: (args: TransformOptions) => Promise<Assets>
  ): void;

  // hooks
  registerHook(event: "build", callback: (args: BuildEventArgs) => void);
};

export type PluginInterface = {
  load(context: PluginContext);
};
