export function isPortableDeployment(
  buildTarget: string | undefined,
  hostname: string | undefined,
) {
  return (
    buildTarget === "vercel" ||
    hostname?.toLowerCase().endsWith(".vercel.app") === true
  );
}

const isVercelBuild = isPortableDeployment(
  import.meta.env.VITE_DEPLOYMENT_TARGET,
  typeof window !== "undefined" ? window.location.hostname : undefined,
);

function asset(managedPath: string, portablePath: string) {
  return isVercelBuild ? portablePath : managedPath;
}

export const deploymentAssets = {
  logo: asset(
    "/manus-storage/avoidit-circular-arrow-transparent_646598d2.png",
    "/media/avoidit-circular-arrow-transparent.png",
  ),
  heroVideo: asset(
    "/manus-storage/avoidit-hero-video-1440p-lite_28df1650.mp4",
    "/media/avoidit-hero-video.mp4",
  ),
  heroPoster: asset(
    "/manus-storage/avoidit-hero-video-poster_ee375c33.webp",
    "/media/avoidit-hero-video-poster.webp",
  ),
  aboutBanner: asset(
    "/manus-storage/avoidit_brand_banner_final_abe42bd6.webp",
    "/media/avoidit-brand-banner.webp",
  ),
} as const;
