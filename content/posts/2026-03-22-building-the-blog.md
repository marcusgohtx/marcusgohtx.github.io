---
title: "Building the Blog"
publishedAt: "2026-03-22"
summary: "Why I decided to keep the blog inside the main Next.js site instead of splitting it into a separate stack."
tags:
  - website
  - nextjs
  - notes
draft: false
---

I wanted a writing workflow that felt lightweight: a folder of Markdown files, a little metadata, and a site that turns those files into pages automatically.

At first, a separate Jekyll blog sounded attractive because GitHub Pages has a long history with Jekyll. But the more I looked at the tradeoffs, the clearer it became that the blog belongs inside the main site.

Keeping everything in one Next.js app means:

- the blog uses the same layout and navigation as the rest of the site
- styling stays consistent with the projects section
- interactive projects like `schedular` can continue evolving independently
- publishing a post is just committing another Markdown file

This setup keeps the authoring model simple without fragmenting the site itself.
