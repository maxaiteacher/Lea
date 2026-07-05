"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DiaryForm({ plantId }: { plantId: number }) {
  const router = useRouter();
  const [memo, setMemo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    let photoPath: string | undefined;
    if (file) {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      if (!up.ok) {
        const d = await up.json().catch(() => ({}));
        setError(d.error ?? "사진 업로드 실패");
        setLoading(false);
        return;
      }
      photoPath = (await up.json()).path;
    }

    const res = await fetch("/api/diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantId, memo, photoPath }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "일지 저장 실패");
      return;
    }
    setMemo("");
    setFile(null);
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-lg border border-leaf-100 bg-white p-4 shadow-sm"
    >
      <h3 className="font-semibold text-leaf-700">오늘의 기록</h3>
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="예: 잎이 많이 자람. 물 줌."
        rows={3}
        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-leaf-500 focus:outline-none"
        required
      />
      <div>
        <label className="mb-1 block text-sm text-gray-600">
          사진 첨부 (선택)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
      >
        {loading ? "저장 중..." : "기록 추가"}
      </button>
    </form>
  );
}
