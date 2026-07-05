"use client";

import { useEffect, useState } from "react";

interface Recipe {
  dish: string;
  description: string;
}

export default function RecipesPage() {
  const [plantNames, setPlantNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [custom, setCustom] = useState("");
  const [results, setResults] = useState<Recipe[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/plants")
      .then((r) => r.json())
      .then((plants: { name: string }[]) => {
        const names = Array.from(new Set(plants.map((p) => p.name)));
        setPlantNames(names);
        setSelected(new Set(names));
      })
      .catch(() => {});
  }, []);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResults(null);

    const ingredients = [
      ...selected,
      ...custom
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ];
    if (ingredients.length === 0) {
      setError("재료를 하나 이상 선택하거나 입력하세요.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/ai/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "레시피를 가져오지 못했습니다.");
      return;
    }
    setResults(data.recipes ?? []);
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-leaf-700">🍳 레시피 추천</h1>
      <p className="mb-4 text-sm text-gray-600">
        수확 가능한 재료를 고르면 AI가 어울리는 요리를 추천해 드려요.
      </p>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-lg border border-leaf-100 bg-white p-6 shadow-sm"
      >
        <div>
          <p className="mb-2 text-sm font-medium">내 식물에서 선택</p>
          {plantNames.length === 0 ? (
            <p className="text-sm text-gray-500">
              등록된 식물이 없어요. 아래에 직접 입력해 주세요.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {plantNames.map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => toggle(name)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    selected.has(name)
                      ? "border-leaf-500 bg-leaf-500 text-white"
                      : "border-gray-300 text-gray-600 hover:bg-leaf-50"
                  }`}
                >
                  {selected.has(name) ? "✓ " : ""}
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            직접 입력 (쉼표로 구분)
          </label>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="예: 대파, 계란"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-leaf-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-leaf-600 px-4 py-2 font-medium text-white hover:bg-leaf-700 disabled:opacity-50"
        >
          {loading ? "레시피 찾는 중..." : "레시피 추천 받기"}
        </button>
      </form>

      {results && (
        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold text-leaf-700">추천 요리</h2>
          {results.length === 0 ? (
            <p className="text-sm text-gray-500">추천 결과가 없습니다.</p>
          ) : (
            results.map((r, i) => (
              <div
                key={i}
                className="rounded-lg border border-leaf-100 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold text-leaf-700">🍽️ {r.dish}</p>
                <p className="mt-1 text-sm text-gray-600">{r.description}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
