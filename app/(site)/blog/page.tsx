import type { Metadata } from "next";

import { BlogList } from "./_components/blog-list";
import { getAllPosts } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes, essays, and build logs from Marcus Goh.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <section className="max-w-4xl space-y-5">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          Writing about systems, software, and the projects I am building.
        </p>
      </div>

      {posts.length > 0 ? (
        <BlogList posts={posts} />
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-sm text-muted-foreground">
          No posts yet. Add a Markdown file in <code>content/posts</code> to publish one.
        </div>
      )}
    </section>
  );
}
