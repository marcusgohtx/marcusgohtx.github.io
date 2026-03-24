# AGENTS.md

- This repo is a Next.js personal site deployed to GitHub Pages via `.github/workflows/deploy.yml`.
- The site is statically exported with `output: "export"` and `trailingSlash: true`.
- Keep interactive projects such as `schedular` inside the Next.js app.

## Blog

- Keep the blog inside the main Next.js app; do not split it into Jekyll or a separate site unless explicitly requested.
- Blog index: `app/(site)/blog/page.tsx`
- Blog posts: `app/(site)/blog/[slug]/page.tsx`
- Blog content lives in `content/posts/*.md`
- Blog helpers live in `lib/blog/`

## Content Conventions

- Posts use Markdown front matter with: `title`, `publishedAt`, `summary`, `tags`, `draft`
- Recommended filename format: `YYYY-MM-DD-slug.md`
- Route slugs strip the leading date prefix from the filename
- `draft: true` excludes a post from the published site

## Preferences

- Prefer one cohesive site over split architectures
- Prefer simplicity over extra blog features unless explicitly requested
- Avoid adding sitemap, RSS, MDX, or similar heavier additions by default
- Keep the blog visually consistent with the existing site shell and card-based design
