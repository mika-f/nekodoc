import React, { useEffect } from "react";
import runtime from "react/jsx-runtime";
import { Helmet, HelmetProvider } from "react-helmet-async";

import type { MDXComponents } from "mdx/types";

type Props = {
  frontmatter: Record<string, unknown>;
  mdx: string;
  components: MDXComponents;
  context?: {};
};

const App: React.FC<Props> = ({ frontmatter, mdx, components, context }) => {
  useEffect(() => {}, []);

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
      {/* eslint-disable-next-line @typescript-eslint/no-implied-eval */}
      {new Function(mdx)({ ...runtime }).default({ components })}
    </HelmetProvider>
  );
};

export default App;
