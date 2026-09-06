"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { signIn, signUp } from "./actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/notes";

  const [signInMessage, signInAction, signInPending] = useActionState(signIn, null);
  const [signUpMessage, signUpAction, signUpPending] = useActionState(signUp, null);
  const message = signInMessage ?? signUpMessage;
  const pending = signInPending || signUpPending;

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">로그인</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Supabase Auth의 이메일·비밀번호 로그인을 사용합니다.
        </p>
      </div>

      <form className="space-y-3">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <label className="block space-y-1">
          <span className="text-sm font-medium">이메일</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">비밀번호</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="current-password"
            className="w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
          />
        </label>

        <div className="flex gap-2 pt-1">
          <button
            formAction={signInAction}
            disabled={pending}
            className="flex-1 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
          >
            로그인
          </button>
          <button
            formAction={signUpAction}
            disabled={pending}
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-neutral-700"
          >
            회원가입
          </button>
        </div>
      </form>

      {message ? (
        <p className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
