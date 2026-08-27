import { access, cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "vercel-assets", "media");
const destination = resolve(root, "public", "media");

try {
  await access(source);
} catch {
  throw new Error("Missing vercel-assets/media. Restore the reviewed portable media bundle before building for Vercel.");
}

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
