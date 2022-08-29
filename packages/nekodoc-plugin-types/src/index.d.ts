export type NekoDocConfiguration = {
  /**
   * project root directory
   * @default process.cwd()
   */
  root?: string;

  /**
   * directory to serve as plain (not compiled) static objects.
   * @default `./public`
   */
  publicDir?: string;

  /**
   * directory to save cache files of compilers.
   * @default `./.nekodoc`
   */
  cacheDir?: string;

  /**
   * directory to serve as static page (compiled as html) markdown and mdx contents.
   * @default `./contents`
   */
  contentDir?: string;

  /**
   * override commands build mode
   */
  mode?: "development" | "production";

  /**
   * define global variable replacements.
   */
  define?: Record<string, any>;

  /**
   * array of NekoDoc plugins to use.
   */
  plugins?: string[];

  /**
   * configuration options to use markdown compiler.
   */
  markdown?: {
    /**
     * rehype plugins to use.
     */
    rehypePlugins?: any[];

    /**
     * remark plugins to use.
     */
    remarkPlugins?: any[];

    /**
     * mdx global components.
     * key is the name of component.
     * value is path of the component.
     */
    components?: Record<string, string>;

    /**
     * layout components specified in frontmatter.
     * key is the name of layout.
     * value is path of the layout component.
     */
    layouts?: Record<string, string>;

    /**
     * use trailing slash style urls.
     * @default true
     */
    trailingSlash?: boolean;
  };

  /**
   * path of the configuration file of TailwindCSS.
   * @default `./tailwind.config.js`
   */
  tailwind?: string;

  /**
   * others
   */
  [key: string]: unknown;
};

type UserConfigArgs = {
  command: "start" | "build";
};

type UserConfigFn = (
  env: UserConfigArgs
) => UserConfigExport | Promise<NekoDocConfiguration>;

export type UserConfigExport =
  | NekoDocConfiguration
  | Promise<NekoDocConfiguration>
  | UserConfigFn;

export type DefineConfigFn = (obj: UserConfigExport) => UserConfigExport;

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
