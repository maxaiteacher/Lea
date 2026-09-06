import Link from "next/link";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// 접속 상태를 매 요청마다 확인해야 하므로 정적 생성을 하지 않는다.
export const dynamic = "force-dynamic";

type Check = { label: string; ok: boolean; detail: string };

async function runChecks(): Promise<Check[]> {
  const checks: Check[] = [
    {
      label: "환경변수",
      ok: hasSupabaseEnv,
      detail: hasSupabaseEnv
        ? "NEXT_PUBLIC_SUPABASE_URL 과 키를 모두 읽었습니다."
        : "NEXT_PUBLIC_SUPABASE_URL 또는 키가 비어 있습니다.",
    },
  ];

  if (!hasSupabaseEnv) return checks;

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  checks.push({
    label: "Auth 연결",
    ok: !authError,
    detail: authError
      ? authError.message
      : authData.user
        ? `${authData.user.email} 로 로그인되어 있습니다.`
        : "Supabase 인증 서버와 통신했습니다. (아직 로그인하지 않은 상태)",
  });

  const { error: dbError } = await supabase
    .from("notes")
    .select("id", { count: "exact", head: true });
  checks.push({
    label: "데이터베이스",
    ok: !dbError,
    detail: dbError
      ? `${dbError.message} — supabase/migrations/0001_init.sql 을 실행했는지 확인하세요.`
      : "notes 테이블을 조회했습니다.",
  });

  const { error: storageError } = await supabase.storage
    .from("uploads")
    .list("", { limit: 1 });
  checks.push({
    label: "스토리지",
    ok: !storageError,
    detail: storageError
      ? `${storageError.message} — uploads 버킷이 있는지 확인하세요.`
      : "uploads 버킷에 접근했습니다.",
  });

  return checks;
}

export default async function HomePage() {
  const checks = await runChecks();

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">FocusLens</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Vercel에 배포하고 Supabase의 데이터베이스·인증·스토리지를 사용하는 Next.js
          앱입니다. 아래에서 각 연결이 정상인지 바로 확인할 수 있습니다.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">연결 상태</h2>
        <ul className="space-y-2">
          {checks.map((check) => (
            <li
              key={check.label}
              className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
            >
              <div className="flex items-center gap-2 font-medium">
                <span aria-hidden>{check.ok ? "✅" : "⚠️"}</span>
                <span>{check.label}</span>
                <span className="sr-only">{check.ok ? "정상" : "확인 필요"}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {check.detail}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">둘러보기</h2>
        <ul className="list-inside list-disc space-y-1 text-sm">
          <li>
            <Link href="/notes" className="underline">
              메모
            </Link>{" "}
            — RLS가 적용된 테이블에 로그인한 사용자의 데이터만 저장하고 읽습니다.
          </li>
          <li>
            <Link href="/files" className="underline">
              파일
            </Link>{" "}
            — 비공개 버킷에 파일을 올리고 서명된 URL로 내려받습니다.
          </li>
          <li>
            <Link href="/api/health" className="underline">
              /api/health
            </Link>{" "}
            — 배포 환경의 설정 상태를 JSON으로 확인합니다.
          </li>
        </ul>
      </section>
    </div>
  );
}
