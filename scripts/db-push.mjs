// 빌드 시 DB에 테이블을 생성한다.
// Vercel의 Postgres 연동은 환경변수 이름이 제각각이라(DATABASE_URL,
// POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING 등) 여러 후보를 순서대로 찾는다.
// 스키마 반영(DDL)에는 pooled(pgbouncer)보다 direct 연결이 안전하므로 우선한다.
import { execSync } from "node:child_process";

const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  "";

if (!url) {
  console.log(
    "ℹ️  DB 연결 없음: db push 건너뜀. (Vercel Storage에서 Postgres 연결 후 재배포하면 테이블이 생성됩니다.)"
  );
  process.exit(0);
}

try {
  console.log("🗄️  prisma db push 실행 (테이블 생성/동기화)...");
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
  console.log("✅ db push 완료");
} catch (e) {
  // 배포 자체는 살려두고(사이트는 뜨게) 경고만 남긴다.
  console.error(
    "⚠️ db push 실패 — DB 연결 문자열을 확인하세요. 사이트는 배포되지만 저장 기능이 동작하지 않을 수 있습니다."
  );
  console.error(e.message);
  process.exit(0);
}
