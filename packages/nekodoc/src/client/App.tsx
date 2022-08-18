import React, { useEffect } from "react";
import runtime from "react/jsx-runtime";

type Props = {
  mdx: string;
};

const App: React.FC<Props> = ({ mdx }) => {
  useEffect(() => {}, []);

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return <>{new Function(mdx)({ ...runtime }).default({ components: {} })}</>;
};

export default App;
