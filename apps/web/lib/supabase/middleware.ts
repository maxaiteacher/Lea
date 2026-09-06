import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabaseEnv } from "./env";

/** 로그인해야만 접근할 수 있는 경로들이다. */
const PROTECTED_PREFIXES = ["/notes", "/files"];

/**
 * 만료가 임박한 액세스 토큰을 갱신하고, 갱신된 쿠키를 요청과 응답 양쪽에 반영한다.
 * 서버 컴포넌트는 쿠키를 쓸 수 없으므로 이 갱신 작업을 미들웨어가 대신 처리한다.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // 환경변수가 아직 없는 상태(최초 배포 직후 등)에서도 사이트 자체는 뜨게 둔다.
  // 다만 Supabase가 반드시 필요한 경로는 오류 화면 대신 홈으로 보내서,
  // 어떤 설정이 빠졌는지 홈의 연결 상태 목록에서 확인하도록 안내한다.
  if (!hasSupabaseEnv) {
    if (needsAuth) {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = "/";
      homeUrl.search = "";
      return NextResponse.redirect(homeUrl);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // getUser()는 Supabase 서버에 토큰을 검증받는다.
  // getSession()과 달리 쿠키 값을 그대로 믿지 않으므로 미들웨어에서는 이쪽을 써야 한다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && needsAuth) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
