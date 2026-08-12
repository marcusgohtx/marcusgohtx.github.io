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
    <section className="blog-index">
      <header className="blog-index-heading">
        <h1 className="field-notes-title">Blog</h1>
        <p>
          Writing about systems, software, and the projects I am building.
        </p>
      </header>

      {posts.length > 0 ? (
        <BlogList posts={posts} />
      ) : (
        <div className="blog-empty">
          No posts yet. Add a Markdown file in <code>content/posts</code> to publish one.
        </div>
      )}
    </section>
  );
}
