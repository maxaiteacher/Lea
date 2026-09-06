import { NextResponse } from "next/server";

import { SUPABASE_URL, hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * 배포 환경의 설정 상태를 점검한다.
 * 키 값 자체는 절대 응답에 넣지 않고, 설정 여부와 호스트 이름만 알려 준다.
 */
export async function GET() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
    ),
  };

  if (!hasSupabaseEnv) {
    return NextResponse.json({ ok: false, env, reason: "missing_env" }, { status: 503 });
  }

  const supabase = await createClient();
  const [{ error: authError }, { error: dbError }, { error: storageError }] =
    await Promise.all([
      supabase.auth.getUser(),
      supabase.from("notes").select("id", { count: "exact", head: true }),
      supabase.storage.from("uploads").list("", { limit: 1 }),
    ]);

  const checks = {
    auth: authError ? authError.message : "ok",
    database: dbError ? dbError.message : "ok",
    storage: storageError ? storageError.message : "ok",
  };

  const ok = !dbError && !storageError;

  return NextResponse.json(
    {
      ok,
      host: (() => {
        try {
          return new URL(SUPABASE_URL).host;
        } catch {
          return null;
        }
      })(),
      env,
      checks,
    },
    { status: ok ? 200 : 503 }
  );
}
