import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const distRoot = path.join(repoRoot, "dist");
const siteRoot = path.join(repoRoot, "site");
const appDist = path.join(repoRoot, "projects", "isometric-drawing-tool", "dist");
const appTarget = path.join(distRoot, "isometric-drawing-tool");
const algebraDist = path.join(repoRoot, "projects", "algebra-balance-lab", "dist");
const algebraTarget = path.join(distRoot, "algebra-balance-lab");

await rm(distRoot, { recursive: true, force: true });
await mkdir(distRoot, { recursive: true });

await cp(siteRoot, distRoot, { recursive: true });
await mkdir(appTarget, { recursive: true });
await cp(appDist, appTarget, { recursive: true });
await mkdir(algebraTarget, { recursive: true });
await cp(algebraDist, algebraTarget, { recursive: true });

console.log(`GitHub Pages site assembled at ${distRoot}`);
