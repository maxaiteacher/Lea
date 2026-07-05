import { PrismaClient } from "@prisma/client";

// Vercel의 Postgres 연동은 연결 문자열 환경변수 이름이 제각각이다.
// schema.prisma는 env("DATABASE_URL")을 읽으므로, 비어 있으면 다른 후보 이름에서
// 값을 찾아 DATABASE_URL로 채워 넣는다. (런타임 클라이언트는 pooled 연결 우선)
if (!process.env.DATABASE_URL) {
  const fallback =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (fallback) process.env.DATABASE_URL = fallback;
}

// 개발 모드의 hot-reload 시 PrismaClient 인스턴스가 중복 생성되는 것을 방지.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
