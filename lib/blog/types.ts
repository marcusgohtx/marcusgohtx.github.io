export type PostMetadata = {
  slug: string;
  title: string;
  publishedAt: string;
  summary: string;
  tags: string[];
  draft: boolean;
};

export type Post = PostMetadata & {
  contentHtml: string;
};
