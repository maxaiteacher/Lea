// Supabase 접속 정보를 읽어 온다.
// NEXT_PUBLIC_* 값은 빌드 시점에 문자열로 치환되므로, 반드시 이렇게 리터럴로
// 참조해야 브라우저 번들에도 값이 들어간다. (process.env[변수명] 방식은 동작하지 않는다.)
//
// Supabase 대시보드가 최근 개편되면서 키 이름이 두 가지로 나뉘었다.
//   - 예전 이름: anon key  (eyJ... 로 시작하는 JWT)
//   - 새 이름:   publishable key (sb_publishable_... 로 시작)
// 둘 중 어느 쪽을 넣어도 동작하도록 두 환경변수를 모두 지원한다.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

export const hasSupabaseEnv = SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "";

/** 접속 정보가 없으면 원인을 알기 쉬운 오류를 던진다. */
export function assertSupabaseEnv() {
  if (!hasSupabaseEnv) {
    throw new Error(
      "Supabase 환경변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL 과 " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY(또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)를 " +
        ".env.local 또는 Vercel 환경변수에 추가한 뒤 다시 배포하세요."
    );
  }
}
