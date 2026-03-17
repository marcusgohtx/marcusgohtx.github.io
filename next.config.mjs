const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserSiteRepo = repositoryName.endsWith(".github.io");
const basePath =
  isGitHubActions && repositoryName && !isUserSiteRepo ? `/${repositoryName}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
