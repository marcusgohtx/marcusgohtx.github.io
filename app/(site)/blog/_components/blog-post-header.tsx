import type { PostMetadata } from "@/lib/blog/types";

function formatPublishedDate(publishedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(new Date(publishedAt));
}

export function BlogPostHeader({ post }: { post: PostMetadata }) {
  return (
    <header className="blog-post-header">
      <div className="blog-post-meta">
        <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt)}</time>
        <div className="blog-tags">
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      <div className="blog-post-heading">
        <h1>{post.title}</h1>
        <p>{post.summary}</p>
      </div>
    </header>
  );
}
