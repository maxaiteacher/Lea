import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SUPABASE_ANON_KEY, SUPABASE_URL, assertSupabaseEnv } from "./env";

/**
 * 서버(서버 컴포넌트·서버 액션·Route Handler)에서 사용하는 Supabase 클라이언트를 만든다.
 * 요청마다 새로 만들어야 하므로 모듈 수준에서 재사용하지 않는다.
 */
export async function createClient() {
  assertSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없어 예외가 발생한다.
          // 세션 갱신은 미들웨어가 담당하므로 이 경우는 무시해도 안전하다.
        }
      },
    },
  });
}
