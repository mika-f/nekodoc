const path = require("path");

/* NekoDoc Configuration */
module.exports = {
  cacheDir: ".nekodoc",
  contentDir: "contents",
  cleanUrls: true,
  components: {
    // overrides
    a: path.resolve(__dirname, "components", "Hyperlink.tsx"),
    h1: path.resolve(__dirname, "components", "Heading1.tsx"),
    p: path.resolve(__dirname, "components", "Paragraph.tsx"),

    // new
    Container: path.resolve(__dirname, "components", "Container.tsx"),
  },
  layouts: {
    // default: path.resolve(__dirname, "layouts", "DefaultLayout.tsx"),
  },
  tailwind: "tailwind.config.js",
  trailingSlash: true,
};
