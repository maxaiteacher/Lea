"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

/**
 * 파일을 브라우저에서 Supabase Storage로 곧장 올린다.
 * 서버 라우트를 거치지 않으므로 Vercel의 요청 본문 크기 제한에 걸리지 않는다.
 */
export default function Uploader({ userId }: { userId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    // 폴더 이름을 사용자 ID로 두면 RLS 정책이 폴더 단위로 접근을 통제할 수 있다.
    const safeName = file.name.replace(/[^\w.\-]/g, "_");
    const path = `${userId}/${Date.now()}_${safeName}`;

    const supabase = createClient();
    const { error } = await supabase.storage.from("uploads").upload(path, file);

    setUploading(false);
    event.target.value = "";

    if (error) {
      setMessage(`업로드에 실패했습니다: ${error.message}`);
      return;
    }

    setMessage(`${file.name} 을 올렸습니다.`);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700">
        <span>{uploading ? "올리는 중…" : "파일 선택"}</span>
        <input
          type="file"
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />
      </label>
      {message ? <p className="text-sm text-neutral-600">{message}</p> : null}
    </div>
  );
}
