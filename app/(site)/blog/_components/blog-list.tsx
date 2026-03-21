import Link from "next/link";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PostMetadata } from "@/lib/blog/types";

function formatPublishedDate(publishedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(new Date(publishedAt));
}

export function BlogList({ posts }: { posts: PostMetadata[] }) {
  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
          <Card className="h-full transition-colors hover:bg-secondary/50">
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt)}</time>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-2">
                <CardTitle>{post.title}</CardTitle>
                <CardDescription className="text-sm leading-6">{post.summary}</CardDescription>
                <p className="text-sm font-medium text-foreground">Read post</p>
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
