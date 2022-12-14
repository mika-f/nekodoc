import React from "react";
import ReactDOM from "react-dom/client";

import "./app.css";

// eslint-disable-next-line import/no-named-as-default
import App from "./App.js";

// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
declare const __NEKODOC_DATA__: {
  frontmatter: Record<string, unknown>;
  mdx: string;
};

const run = () => {
  const hasInjectedData = document.querySelector("#__NEKODOC_DATA__");
  if (hasInjectedData) {
    const container = document.querySelector("#nekodoc");
    if (container) {
      const { frontmatter, mdx } = __NEKODOC_DATA__;
      // eslint-disable-next-line no-underscore-dangle
      const components = (window as any).__NEKODOC_COMPONENTS__;

      ReactDOM.hydrateRoot(
        container,
        <App frontmatter={frontmatter} mdx={mdx} components={components} />
      );
    }
  }
};

export default run;
