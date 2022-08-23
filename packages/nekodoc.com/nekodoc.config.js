const path = require("path");

/* NekoDoc Configuration */
module.exports = {
  cacheDir: ".nekodoc",
  contentDir: "contents",
  cleanUrls: true,
  components: {
    // overrides
    a: path.resolve(__dirname, "components", "Hyperlink.tsx"),
    code: path.resolve(__dirname, "components", "Code.tsx"),
    h1: path.resolve(__dirname, "components", "Heading1.tsx"),
    h2: path.resolve(__dirname, "components", "Heading2.tsx"),
    p: path.resolve(__dirname, "components", "Paragraph.tsx"),
    ul: path.resolve(__dirname, "components", "UnorderedList.tsx"),

    // new
    Container: path.resolve(__dirname, "components", "Container.tsx"),
    Tab: path.resolve(__dirname, "components", "Tab.tsx"),
    TabItem: path.resolve(__dirname, "components", "TabItem.tsx"),
  },
  layouts: {
    Default: path.resolve(__dirname, "layouts", "DefaultLayout.tsx"),
  },
  tailwind: "tailwind.config.js",
  trailingSlash: true,
  plugins: [],
};
