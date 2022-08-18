import { compile } from "@mdx-js/mdx";
import fs from "fs/promises";
import yaml from "js-yaml";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";

type TransformMarkdownOptions = {
  markdown: string;
  remarkPlugins?: any[];
  rehypePlugins?: any[];
};

const parseFrontmatter = async (
  content: string
): Promise<Record<string, unknown>> => {
  const regex = /---(\r|\n|.)*?---/gm;
  if (regex.test(content)) {
    const frontmatter = /---((\r|\n|.)*?)---/gm.exec(content)![1];
    return yaml.loadAll(frontmatter)[0] as Record<string, unknown>;
  }

  return {};
};

const transformMarkdown = async (
  options: TransformMarkdownOptions
): Promise<{ frontmatter: Record<string, unknown>; mdx: string }> => {
  const content = (await fs.readFile(options.markdown)).toString();
  const frontmatter = await parseFrontmatter(content);
  const javascript = await compile(content, {
    remarkPlugins: [
      remarkFrontmatter,
      remarkGfm,
      ...(options.remarkPlugins ?? []),
    ],
    rehypePlugins: options.rehypePlugins,
    outputFormat: "function-body",
    jsxRuntime: "automatic",
  });

  return { frontmatter, mdx: javascript.value.toString() };
};

export default transformMarkdown;
