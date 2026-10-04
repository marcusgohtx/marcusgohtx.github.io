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
3. In GitHub settings, set Pages source to **Deploy from a branch**, using `gh-pages` and `/ (root)`.
4. The workflow at `.github/workflows/deploy.yml` builds the site and publishes its export to that branch automatically.

`next.config.mjs` auto-detects your repository name in Actions and sets `basePath` accordingly.

## Independent applications

The personal website remains in this repository's root. The application folders are Git submodules, each with its own repository and deployment:

| Local folder | Repository | Public app |
| --- | --- | --- |
| `schedular/` | [schedular-app](https://github.com/marcusgohtx/schedular-app) | [Open Schedular](https://marcusgohtx.github.io/schedular-app/) |
| `ikigai-for-humanity/` | [ikigai-for-humanity](https://github.com/marcusgohtx/ikigai-for-humanity) | [Open Ikigai for Humanity](https://ikigai-for-humanity.marcusgohtx.chatgpt.site/) |
| `results-reporter/` | [results-reporter](https://github.com/marcusgohtx/results-reporter) | [Open Results Reporter](https://marcusgohtx.github.io/results-reporter/) |

The older private `marcusgohtx/schedular` repository is separate and has not been changed.

For a fresh checkout with all apps:

```bash
git clone --recurse-submodules https://github.com/marcusgohtx/marcusgohtx.github.io.git
```

For an existing checkout:

```bash
git submodule update --init --recursive
```

Run an app's commands from its own folder. Each app's README explains its development and deployment workflow. The website build does not build the applications or require their dependencies.

Commit and push application changes inside the application's repository first. Then commit the updated submodule pointer in this repository if you want this checkout to record that version. This keeps each app's code and history independent while showing clickable repository entries on GitHub.

Website project links are defined in `content/projects.ts`. Old `/projects/schedular/`, `/projects/ikigai/`, `/projects/results-reporter/`, `/ikigai/`, and `/ikigai-game/index.html` addresses remain as client-side redirects, preserving query strings and fragments. GitHub Pages cannot issue custom server-side 301 redirects.

Schedular and Results Reporter remain on the `marcusgohtx.github.io` origin. Ikigai for Humanity runs on ChatGPT Sites with multiplayer rooms stored in its managed database.
