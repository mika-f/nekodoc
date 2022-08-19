import React from "react";
import ReactDOM from "react-dom/server";

import type { FilledContext } from "react-helmet-async";
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
  const context = {} as FilledContext;

  const jsx = ReactDOM.renderToString(
    <App
      frontmatter={frontmatter}
      mdx={mdx}
      components={components}
      context={context}
    />
  );

  const { helmet } = context;

  return `
<!DOCTYPE html>
${
  helmet.htmlAttributes.toString() === ""
    ? "<html>"
    : `<html ${helmet.htmlAttributes}`
}
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="generator" content="NekoDoc">
    ${helmet.meta}
    ${helmet.title}
    ${helmet.link}
    ${helmet.style}
    ${stylesheets.map((w) => `<link rel="stylesheet" href="${w}" />`)}
    ${scripts.map((w) => `<script src="${w}" async defer></script>`)}
  </head>
  ${
    helmet.bodyAttributes.toString() === ""
      ? "<body>"
      : `<body ${helmet.bodyAttributes}>`
  }
    ${helmet.noscript}
    <div id="nekodoc">${jsx}</div>
    <script id="__NEKODOC_DATA__">
      const __NEKODOC_DATA__ = ${JSON.stringify({ frontmatter, mdx })}
    </script>
    ${helmet.script}
  </body>
</html>
    `;
};

export default renderAsHtml;
