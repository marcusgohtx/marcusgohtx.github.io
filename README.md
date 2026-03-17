# Personal Website (Next.js + shadcn/ui)

A responsive personal website scaffold using Next.js, Tailwind CSS, and shadcn-style UI primitives.

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

## GitHub Pages deployment

1. Push this repository to GitHub.
2. Ensure your default branch is `main`.
3. In GitHub settings, set Pages source to **GitHub Actions**.
4. The workflow at `.github/workflows/deploy.yml` will build and deploy automatically.

`next.config.mjs` auto-detects your repository name in Actions and sets `basePath` accordingly.