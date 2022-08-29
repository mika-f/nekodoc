import path from "path";
import { defineConfig } from "nekodoc";
import { fileURLToPath } from "url";

export default defineConfig(async ({ command }) => {
  const dirname = path.dirname(fileURLToPath(import.meta.url));

  const plugins = command === "start" ? [] : [];

  return {
    plugins,
    markdown: {
      components: {
        // overrides
        a: path.resolve(dirname, "components", "Hyperlink.tsx"),
        code: path.resolve(dirname, "components", "Code.tsx"),
        h1: path.resolve(dirname, "components", "Heading1.tsx"),
        h2: path.resolve(dirname, "components", "Heading2.tsx"),
        p: path.resolve(dirname, "components", "Paragraph.tsx"),
        ul: path.resolve(dirname, "components", "UnorderedList.tsx"),

        // new
        Container: path.resolve(dirname, "components", "Container.tsx"),
        Tab: path.resolve(dirname, "components", "Tab.tsx"),
        TabItem: path.resolve(dirname, "components", "TabItem.tsx"),
      },
      layouts: {
        Default: path.resolve(dirname, "layouts", "DefaultLayout.tsx"),
      },
    },
  };
});
