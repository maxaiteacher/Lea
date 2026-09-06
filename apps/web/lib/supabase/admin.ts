import "server-only";

import { createClient } from "@supabase/supabase-js";

import { SUPABASE_URL, assertSupabaseEnv } from "./env";

/**
 * RLS를 우회하는 관리자 클라이언트를 만든다.
 * service role 키는 절대 브라우저로 내려가면 안 되므로 "server-only" 를 붙여
 * 클라이언트 컴포넌트에서 실수로 가져다 쓰면 빌드가 실패하도록 막았다.
 * 관리자 작업(배치, 웹훅 처리 등)이 꼭 필요할 때만 사용한다.
 */
export function createAdminClient() {
  assertSupabaseEnv();

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY(또는 SUPABASE_SECRET_KEY)가 설정되지 않았습니다."
    );
  }

  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
