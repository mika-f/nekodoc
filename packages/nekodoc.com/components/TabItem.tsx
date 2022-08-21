import React from "react";

type Props = {
  children: React.ReactElement;
  title: string;
  tabKey: string;
};

const TabItem: React.FC<Props> = ({ children }) => <div>{children}</div>;

export default TabItem;
