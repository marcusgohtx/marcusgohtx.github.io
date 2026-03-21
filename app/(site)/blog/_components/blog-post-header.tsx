import type { PostMetadata } from "@/lib/blog/types";

function formatPublishedDate(publishedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(new Date(publishedAt));
}

export function BlogPostHeader({ post }: { post: PostMetadata }) {
  return (
    <header className="space-y-5 border-b pb-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt)}</time>
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border/70 bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">{post.summary}</p>
      </div>
    </header>
  );
}
