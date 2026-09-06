import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * PKCE 인증 코드를 세션으로 교환한다.
 * 소셜 로그인과 가입 확인 메일의 링크가 이 경로로 돌아온다.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const redirectPath = next?.startsWith("/") && !next.startsWith("//") ? next : "/notes";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Vercel처럼 프록시 뒤에서 동작하는 환경에서는 x-forwarded-host 가 실제 도메인이다.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const base =
    process.env.NODE_ENV === "production" && forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  return NextResponse.redirect(`${base}${redirectPath}`);
}
