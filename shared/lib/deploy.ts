export const repositoryUrl = "https://github.com/rahmanef63/codex-build-week";

const deployParams = new URLSearchParams({
  "repository-url": repositoryUrl,
  env: "NEXT_PUBLIC_CONVEX_URL,CONVEX_DEPLOY_KEY",
  envDescription:
    "Hubungkan deployment Convex Anda. Deploy key memerlukan izin deploy, env:view, dan env:write.",
  envLink: `${repositoryUrl}#deploy-your-own`,
});

export const vercelDeployUrl = `https://vercel.com/new/clone?${deployParams.toString()}`;
