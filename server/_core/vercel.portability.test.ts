import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const root = new URL("../../", import.meta.url);
const appSource = readFileSync(new URL("./app.ts", import.meta.url), "utf8");
const entrypoint = readFileSync(new URL("../../api/index.ts", import.meta.url), "utf8");
const vercelConfig = JSON.parse(readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"));
const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

describe("Vercel portability configuration", () => {
  it("exports the existing Express app without opening another port", () => {
    expect(appSource).toContain("export default createApp();");
    expect(appSource).not.toContain(".listen(");
    expect(entrypoint).toContain('import app from "../server/_core/app"');
    expect(entrypoint).toContain("export default app;");
  });

  it("builds the Vite SPA, routes API requests to Express, and preserves core static headers", () => {
    expect(packageJson.scripts["build:vercel"]).toContain("vite.vercel.config.ts");
    expect(vercelConfig.outputDirectory).toBe("public");
    expect(vercelConfig.rewrites).toContainEqual({ source: "/api/:path*", destination: "/api" });
    expect(vercelConfig.rewrites).toContainEqual({ source: "/(.*)", destination: "/index.html" });
    expect(vercelConfig.headers[0].headers).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "Content-Security-Policy" }),
      expect.objectContaining({ key: "X-Frame-Options", value: "DENY" }),
    ]));
  });
});
