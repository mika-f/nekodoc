import React from "react";

type Props = {
  children: React.ReactElement;
};

const UnorderedList: React.FC<Props> = ({ children }) => (
  <ul className="ml-2 list-disc list-inside">{children}</ul>
);

export default UnorderedList;
