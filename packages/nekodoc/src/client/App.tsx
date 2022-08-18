import React, { useEffect } from "react";
import runtime from "react/jsx-runtime";
import { Helmet, HelmetProvider } from "react-helmet-async";

type Props = {
  frontmatter: Record<string, unknown>;
  mdx: string;
  context?: {};
};

const App: React.FC<Props> = ({ frontmatter, mdx, context }) => {
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
      {new Function(mdx)({ ...runtime }).default({ components: {} })}
    </HelmetProvider>
  );
};

export default App;
