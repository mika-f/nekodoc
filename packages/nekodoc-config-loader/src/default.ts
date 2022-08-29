const DEFAULT_CONFIGURATION = {
  root: process.cwd(),
  publicDir: "public",
  cacheDir: ".nekodoc",
  contentDir: "contents",
  define: {},
  plugins: ["@nekodoc/plugin-esbuild"],
  markdown: {
    rehypePlugins: [],
    remarkPlugins: [],
    components: {},
    layouts: {},
    trailingSlash: true,
  },
  tailwind: "tailwind.config.js",
};

export default DEFAULT_CONFIGURATION;
