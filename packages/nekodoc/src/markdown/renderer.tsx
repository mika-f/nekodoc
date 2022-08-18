import React from "react";
import ReactDOM from "react-dom/server";

import type { MDXComponents } from "mdx/types";

import App from "../client/App.js";

type RenderAsHtmlOptions = {
  scripts: string[];
  stylesheets: string[];
  frontmatter: Record<string, unknown>;
  mdx: string;
  components: MDXComponents;
};

const renderAsHtml = async ({
  scripts,
  stylesheets,
  frontmatter,
  mdx,
  components,
}: RenderAsHtmlOptions): Promise<string> => {
  const jsx = ReactDOM.renderToString(<App mdx={mdx} />);

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="generator" content="NekoDoc">
    ${stylesheets.map((w) => `<link ref="stylesheet" href="${w}" />`)}
    ${scripts.map((w) => `<script src="${w}" async defer></script>`)}
  </head>
  <body>
    <div id="nekodoc">${jsx}</div>
    <script id="__NEKODOC_DATA__">
      const __NEKODOC_DATA__ = ${JSON.stringify({ frontmatter, mdx })}
    </script>
  </body>
</html>
    `;
};

export default renderAsHtml;