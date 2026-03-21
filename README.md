# Personal Website (Next.js + Markdown Blog)

A responsive personal website built with Next.js, Tailwind CSS, shadcn-style UI primitives, and a file-based Markdown blog.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The build is configured as a static export in `out/` for GitHub Pages.

## Writing blog posts

Add Markdown files to `content/posts/` using a filename like `2026-03-22-my-post.md`.

Each post should include front matter like:

```md
---
title: "My Post"
publishedAt: "2026-03-22"
summary: "A short description for the blog index."
tags:
  - notes
  - website
draft: false
---
```

Posts with `draft: true` are excluded from the published site.

## GitHub Pages deployment

1. Push this repository to GitHub.
2. Ensure your default branch is `main`.
3. In GitHub settings, set Pages source to **GitHub Actions**.
4. The workflow at `.github/workflows/deploy.yml` will build and deploy automatically.

`next.config.mjs` auto-detects your repository name in Actions and sets `basePath` accordingly.
