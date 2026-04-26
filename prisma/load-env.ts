/**
 * Prisma seed / standalone scripts run outside Next.js, so they do not auto-load
 * `.env.development` / `.env.production`. This picks the same file Next uses:
 * - `PRISMA_LOAD_ENV=production` → `.env.production`
 * - `PRISMA_LOAD_ENV=development` → `.env.development`
 * - else `NODE_ENV === "production"` → `.env.production`, otherwise `.env.development`
 */
import dotenv from "dotenv";
import path from "path";

const rootDir = path.resolve(__dirname, "..");

function envFile(): string {
  if (process.env.PRISMA_LOAD_ENV === "production") return ".env.production";
  if (process.env.PRISMA_LOAD_ENV === "development") return ".env.development";
  return process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
}

const file = envFile();
const result = dotenv.config({ path: path.join(rootDir, file) });
if (result.error) {
  console.warn(
    `[prisma/load-env] Could not load ${file} at project root:`,
    result.error.message,
  );
}
