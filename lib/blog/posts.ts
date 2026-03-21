import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";

import { markdownToHtml, parseMarkdownFile } from "@/lib/blog/markdown";
import type { Post, PostMetadata } from "@/lib/blog/types";

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts");

function createSlugFromFilename(filename: string) {
  const baseName = filename.replace(/\.(md|markdown)$/i, "");

  return baseName.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

function sortByPublishedDateDesc(a: PostMetadata, b: PostMetadata) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

const getAllPostsInternal = cache(async (): Promise<Post[]> => {
  const directoryEntries = await fs.readdir(POSTS_DIRECTORY, { withFileTypes: true });
  const filenames = directoryEntries
    .filter((entry) => entry.isFile() && /\.(md|markdown)$/i.test(entry.name))
    .map((entry) => entry.name);

  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const fullPath = path.join(POSTS_DIRECTORY, filename);
      const fileContents = await fs.readFile(fullPath, "utf8");
      const { frontmatter, content } = parseMarkdownFile(fileContents);

      return {
        slug: createSlugFromFilename(filename),
        ...frontmatter,
        contentHtml: await markdownToHtml(content),
      };
    })
  );

  const seenSlugs = new Set<string>();

  for (const post of posts) {
    if (seenSlugs.has(post.slug)) {
      throw new Error(`Duplicate post slug detected: "${post.slug}"`);
    }

    seenSlugs.add(post.slug);
  }

  return posts.sort(sortByPublishedDateDesc);
});

export const getAllPosts = cache(async (): Promise<PostMetadata[]> => {
  const posts = await getAllPostsInternal();

  return posts
    .filter((post) => !post.draft)
    .map(({ contentHtml: _contentHtml, ...post }) => post);
});

export const getAllPostSlugs = cache(async () => {
  const posts = await getAllPosts();

  return posts.map((post) => post.slug);
});

export const getPostBySlug = cache(async (slug: string): Promise<Post | null> => {
  const posts = await getAllPostsInternal();
  const post = posts.find((entry) => entry.slug === slug && !entry.draft);

  return post ?? null;
});
