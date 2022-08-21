import React from "react";

type Props = {
  children: React.ReactElement;
};

const Container: React.FC<Props> = ({ children }) => (
  <div className="container mx-auto">{children}</div>
);

export default Container;
