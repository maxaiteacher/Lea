"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewPlantPage() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [name, setName] = useState("");
  const [plantedDate, setPlantedDate] = useState(today);
  const [interval, setInterval] = useState(3);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/plants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        plantedDate,
        wateringIntervalDays: interval,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "등록에 실패했습니다.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold text-leaf-700">🌱 식물 등록</h1>
      <form
        onSubmit={submit}
        className="space-y-4 rounded-lg border border-leaf-100 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">식물 이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 상추"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-leaf-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">심은 날짜</label>
          <input
            type="date"
            value={plantedDate}
            onChange={(e) => setPlantedDate(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-leaf-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            물 주기 (며칠마다)
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-leaf-500 focus:outline-none"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            예: 3일마다 물을 준다면 3
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-leaf-600 px-4 py-2 font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
        >
          {loading ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  );
}
