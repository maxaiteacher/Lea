"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const MAX_BYTES = 1_500_000; // 1.5MB (base64로 DB에 저장하므로 제한)

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("사진을 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}

export default function DiaryForm({ plantId }: { plantId: number }) {
  const router = useRouter();
  const [memo, setMemo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    let photoPath: string | undefined;
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("이미지 파일만 첨부할 수 있습니다.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("사진 크기는 1.5MB 이하여야 합니다.");
        return;
      }
      try {
        photoPath = await readAsDataUrl(file);
      } catch {
        setError("사진을 읽지 못했습니다.");
        return;
      }
    }

    setLoading(true);
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
          사진 첨부 (선택, 1.5MB 이하)
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
