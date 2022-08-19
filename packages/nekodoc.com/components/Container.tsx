import React from "react";

type Props = {
  children: React.ReactElement;
};

const Container: React.FC<Props> = ({ children }) => (
  <div className="container max-w-[90%] mx-auto">{children}</div>
);

export default Container;
