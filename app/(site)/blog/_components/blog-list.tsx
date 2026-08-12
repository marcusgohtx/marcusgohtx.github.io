import Link from "next/link";

import type { PostMetadata } from "@/lib/blog/types";

function formatPublishedDate(publishedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(new Date(publishedAt));
}

export function BlogList({ posts }: { posts: PostMetadata[] }) {
  return (
    <div className="blog-list">
      {posts.map((post) => (
        <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-row">
          <div className="blog-meta">
            <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt)}</time>
            <div className="blog-tags">
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>

          <div className="blog-entry">
            <h2>{post.title}</h2>
            <p>{post.summary}</p>
            <span className="blog-read">Read post</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
