import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

type ParsedFrontmatter = {
  title: string;
  publishedAt: string;
  summary: string;
  tags: string[];
  draft: boolean;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseMarkdownFile(fileContents: string): {
  frontmatter: ParsedFrontmatter;
  content: string;
} {
  const { data, content } = matter(fileContents);

  if (!isNonEmptyString(data.title)) {
    throw new Error("Each post must include a non-empty title.");
  }

  if (!isNonEmptyString(data.publishedAt) || Number.isNaN(Date.parse(data.publishedAt))) {
    throw new Error("Each post must include a valid publishedAt date.");
  }

  if (!isNonEmptyString(data.summary)) {
    throw new Error("Each post must include a non-empty summary.");
  }

  const tags = Array.isArray(data.tags)
    ? data.tags.filter((tag): tag is string => isNonEmptyString(tag)).map((tag) => tag.trim())
    : [];

  return {
    frontmatter: {
      title: data.title.trim(),
      publishedAt: data.publishedAt,
      summary: data.summary.trim(),
      tags,
      draft: Boolean(data.draft),
    },
    content,
  };
}

export async function markdownToHtml(markdown: string) {
  const processedContent = await remark().use(gfm).use(html).process(markdown);

  return processedContent.toString();
}
