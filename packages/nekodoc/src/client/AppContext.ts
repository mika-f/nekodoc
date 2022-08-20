import React from "react";

import type { MDXComponents } from "mdx/types";

type Props = {
  mdx: string;
  components: MDXComponents;
};

const AppContext = React.createContext<Props>({ mdx: "", components: {} });

export default AppContext;
