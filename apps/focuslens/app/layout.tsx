import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

import "./globals.css";

export const metadata: Metadata = {
  title: "FocusLens",
  description: "Vercel과 Supabase로 배포하는 Next.js 앱",
};

async function getUserEmail() {
  if (!hasSupabaseEnv) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const email = await getUserEmail();

  return (
    <html lang="ko">
      <body>
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <nav className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3 text-sm">
            <Link href="/" className="font-semibold">
              FocusLens
            </Link>
            <Link href="/notes" className="hover:underline">
              메모
            </Link>
            <Link href="/files" className="hover:underline">
              파일
            </Link>
            <div className="ml-auto flex items-center gap-3">
              {email ? (
                <>
                  <span className="text-neutral-500">{email}</span>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="hover:underline">
                      로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="hover:underline">
                  로그인
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
