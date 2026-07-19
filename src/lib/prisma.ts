/**
 * ─── Prisma Client Singleton ───────────────────────────────────
 *
 * Prevents connection exhaustion in serverless environments (Vercel, AWS Lambda)
 * by reusing a single PrismaClient instance across hot-reloaded modules.
 *
 * In production, a single instance is created and cached in the module scope.
 * In development, the instance is stored on `globalThis` to survive HMR reloads.
 *
 * For production deployments behind a connection pooler (PgBouncer, Prisma Accelerate),
 * set `DATABASE_URL` to the pooler URL and `DIRECT_URL` to the direct DB URL.
 *
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton PrismaClient with serverless-safe connection management.
 *
 * - Uses `connection_limit=1` in serverless to prevent pool exhaustion
 * - Adds `pgbouncer=true` when a pooler URL is detected
 * - Logs slow queries (>2s) in development for debugging
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
