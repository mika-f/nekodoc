type NekoDocConfiguration = {
  cacheDir: string;
  cleanUrls: boolean;
  contentDir: string;
  components: Record<string, string>;
  rehypePlugins?: any[];
  remarkPlugins?: any[];
  layouts: Record<string, string>;
  tailwind: string;
  trailingSlash: boolean;
  plugins: string[];
};

const DEFAULT: NekoDocConfiguration = {
  cacheDir: ".nekodoc",
  contentDir: "contents",
  cleanUrls: true,
  components: {},
  layouts: {},
  tailwind: "tailwind.config.js",
  trailingSlash: true,
  plugins: [],
};

const HEADER: string = "/* NekoDoc Configuration */";

export type { NekoDocConfiguration };

export { DEFAULT, HEADER };
