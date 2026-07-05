"use client";

import { useState } from "react";

interface Rec {
  name: string;
  reason: string;
}

const SEASONS = ["봄", "여름", "가을", "겨울"];
const LEVELS = ["초보", "중급", "고급"] as const;

export default function RecommendPage() {
  const [region, setRegion] = useState("");
  const [season, setSeason] = useState("봄");
  const [dailyMinutes, setDailyMinutes] = useState(10);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("초보");

  const [results, setResults] = useState<Rec[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResults(null);
    setLoading(true);
    const res = await fetch("/api/ai/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ region, season, dailyMinutes, level }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "추천을 가져오지 못했습니다.");
      return;
    }
    setResults(data.plants ?? []);
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-leaf-700">🔍 식물 추천</h1>
      <p className="mb-4 text-sm text-gray-600">
        조건을 입력하면 AI가 키우기 좋은 식물을 3~5개 추천해 드려요.
      </p>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-lg border border-leaf-100 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium">거주 지역</label>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="예: 인천"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-leaf-500 focus:outline-none"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">계절</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-leaf-500 focus:outline-none"
            >
              {SEASONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">수준</label>
            <select
              value={level}
              onChange={(e) =>
                setLevel(e.target.value as (typeof LEVELS)[number])
              }
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-leaf-500 focus:outline-none"
            >
              {LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            하루 관리 가능 시간: {dailyMinutes}분
          </label>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={dailyMinutes}
            onChange={(e) => setDailyMinutes(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-leaf-600 px-4 py-2 font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
        >
          {loading ? "추천 받는 중..." : "추천 받기"}
        </button>
      </form>

      {results && (
        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold text-leaf-700">추천 결과</h2>
          {results.length === 0 ? (
            <p className="text-sm text-gray-500">추천 결과가 없습니다.</p>
          ) : (
            results.map((r, i) => (
              <div
                key={i}
                className="rounded-lg border border-leaf-100 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold text-leaf-700">🌿 {r.name}</p>
                <p className="mt-1 text-sm text-gray-600">{r.reason}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
