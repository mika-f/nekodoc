import React, { useMemo } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

import type { MDXComponents } from "mdx/types";

import AppContext from "./AppContext.js";
import DefaultLayout from "./DefaultLayout.js";

type Props = {
  frontmatter: Record<string, unknown>;
  mdx: string;
  components: MDXComponents;
  context?: {};
};

const App: React.FC<Props> = ({ frontmatter, mdx, components, context }) => {
  const value = useMemo(() => ({ mdx, components }), [mdx, components]);
  const Layout = frontmatter.layout
    ? (components[frontmatter.layout as string] as any) ?? DefaultLayout
    : DefaultLayout;

  return (
    <HelmetProvider context={context}>
      <Helmet>
        <>
          <title>{frontmatter.title as string}</title>
          {frontmatter.description && (
            <meta
              name="description"
              content={frontmatter.description as string}
            />
          )}
        </>
      </Helmet>
      <AppContext.Provider value={value}>
        <Layout />
      </AppContext.Provider>
    </HelmetProvider>
  );
};

export default App;
