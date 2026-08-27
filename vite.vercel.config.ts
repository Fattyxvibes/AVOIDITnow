import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

const projectRoot = import.meta.dirname;

/** Removes managed-runtime-only resources from the portable Vercel client. */
function portableHtml(): Plugin {
  return {
    name: "avoidit-portable-html",
    transformIndexHtml(html) {
      return html
        .replace(
          "/manus-storage/avoidit-circular-arrow-transparent_646598d2.png",
          "/media/avoidit-circular-arrow-transparent.png",
        )
        .replace(
          /\s*<script defer src="%VITE_ANALYTICS_ENDPOINT%\/umami" data-website-id="%VITE_ANALYTICS_WEBSITE_ID%"><\/script>/,
          "",
        );
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), jsxLocPlugin(), portableHtml()],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "client", "src"),
      "@shared": path.resolve(projectRoot, "shared"),
    },
  },
  envDir: projectRoot,
  root: path.resolve(projectRoot, "client"),
  // The portable build copies only the reviewed `vercel-assets` media, never
  // development-only Manus instrumentation.
  publicDir: false,
  build: {
    outDir: path.resolve(projectRoot, "public"),
    emptyOutDir: true,
  },
});
