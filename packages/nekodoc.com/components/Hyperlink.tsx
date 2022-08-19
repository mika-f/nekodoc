import React from "react";

type Props = {
  href: string;
  children: React.ReactElement;
};

const Hyperlink: React.FC<Props> = ({ href, children }) => {
  if (href.startsWith("http")) {
    return (
      <a
        className="underline text-sky-500"
        href={href}
        target="_blank"
        rel="noreferrer noopener"
      >
        {children}
      </a>
    );
  }

  return (
    <a className="underline text-sky-500" href={href}>
      {children}
    </a>
  );
};

export default Hyperlink;
