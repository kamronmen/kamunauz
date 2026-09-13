import { PrismaClient } from "@prisma/client";

// On Netlify / Serverless environments, filesystem is read-only except /tmp
if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("./dev.db")) {
    process.env.DATABASE_URL = "file:/tmp/dev.db";
  }
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
