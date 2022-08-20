import React from "react";
import runtime from "react/jsx-runtime";

import AppContext from "./AppContext.js";

type Props = {};

const NekoDocContent: React.FC<Props> = () => (
  <AppContext.Consumer>
    {(value) => {
      if (value.mdx === "") {
        return <div>Failed to render content</div>;
      }

      /* eslint-disable-next-line @typescript-eslint/no-implied-eval */
      return new Function(value.mdx)({ ...runtime }).default({
        components: value.components,
      });
    }}
  </AppContext.Consumer>
);

export default NekoDocContent;
