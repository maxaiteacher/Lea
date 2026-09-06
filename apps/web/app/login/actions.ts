"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const MISSING_ENV_MESSAGE =
  "Supabase 접속 정보가 설정되지 않아 로그인할 수 없습니다. " +
  "NEXT_PUBLIC_SUPABASE_URL 과 키를 환경변수에 추가한 뒤 다시 배포하세요.";

/** 열린 리다이렉트를 막기 위해 같은 사이트의 경로만 허용한다. */
function safeRedirectTo(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/notes";
}

export async function signIn(_prevState: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectTo(formData.get("redirectTo"));

  if (!hasSupabaseEnv) return MISSING_ENV_MESSAGE;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return error.message;

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

export async function signUp(_prevState: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!hasSupabaseEnv) return MISSING_ENV_MESSAGE;

  const origin = (await headers()).get("origin") ?? "";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) return error.message;

  // 이메일 확인이 켜져 있으면 세션 없이 사용자만 만들어진다.
  if (!data.session) {
    return "가입 확인 메일을 보냈습니다. 메일의 링크를 눌러 인증을 마친 뒤 로그인하세요.";
  }

  revalidatePath("/", "layout");
  redirect("/notes");
}
