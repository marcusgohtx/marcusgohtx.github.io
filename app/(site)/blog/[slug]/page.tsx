import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogPostHeader } from "../_components/blog-post-header";
import { Prose } from "../_components/prose";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog/posts";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Link
        href="/blog"
        className="inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Back to blog
      </Link>

      <BlogPostHeader post={post} />

      <Prose>
        <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </Prose>
    </article>
  );
}
