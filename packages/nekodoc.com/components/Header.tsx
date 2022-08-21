import React from "react";

type Props = {};

const Header: React.FC<Props> = () => (
  <header className="h-24 text-white bg-sky-800">
    <div className="container flex flex-row items-center h-12 mx-auto">
      <div className="text-xl font-bold">NekoDoc</div>
    </div>
    <div className="container h-12 mx-auto">
      <ul className="flex flex-row items-center h-full gap-x-8">
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="/getting-started/">Getting Started</a>
        </li>
        <li>
          <a href="/advanced/">Advanced</a>
        </li>
      </ul>
    </div>
  </header>
);

export default Header;
