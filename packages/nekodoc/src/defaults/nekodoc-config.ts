type NekoDocConfiguration = {
  cacheDir: string;
  cleanUrls: boolean;
  components: Record<string, string>;
  layouts: Record<string, string>;
  tailwind: string;
  trailingSlash: boolean;
};

const DEFAULT: NekoDocConfiguration = {
  cacheDir: ".nekodoc",
  cleanUrls: true,
  components: {},
  layouts: {},
  tailwind: "tailwind.config.js",
  trailingSlash: true,
};

const HEADER: string = "/* NekoDoc Configuration */";

export type { NekoDocConfiguration };

export { DEFAULT, HEADER };
