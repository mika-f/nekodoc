import React from "react";
import ReactDOM from "react-dom/client";

// eslint-disable-next-line import/no-named-as-default
import App from "./App.js";

// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
declare const __NEKODOC_DATA__: { mdx: string };

const hasInjectedData = document.querySelector("#__NEKODOC_DATA__");
if (hasInjectedData) {
  const container = document.querySelector("#nekodoc");
  if (container) {
    const { mdx } = __NEKODOC_DATA__;
    ReactDOM.hydrateRoot(container, <App mdx={mdx} />);
  }
}
