import React from "react";
import { Prism as ReactSyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  children: React.ReactElement;
  className?: string;
};

const Code: React.FC<Props> = ({ children, className }) => {
  if (className) {
    const lng = /language-(.*)/.exec(className)!;
    return (
      <ReactSyntaxHighlighter style={vscDarkPlus} language={lng[1]}>
        {/* @ts-expect-error */}
        {children}
      </ReactSyntaxHighlighter>
    );
  }

  return (
    <code className="p-1 text-white break-words bg-gray-700 rounded-sm">
      {children}
    </code>
  );
};

export default Code;
