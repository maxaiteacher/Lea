"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface PlantCardData {
  id: number;
  name: string;
  plantedDate: string;
  wateringIntervalDays: number;
  lastWateredDate: string;
  nextWatering: string;
  daysUntil: number;
  due: boolean;
}

export default function PlantCard({ plant }: { plant: PlantCardData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function water() {
    setLoading(true);
    await fetch(`/api/plants/${plant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ water: true }),
    });
    setLoading(false);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`'${plant.name}'을(를) 삭제할까요? 일지도 함께 삭제됩니다.`))
      return;
    setLoading(true);
    await fetch(`/api/plants/${plant.id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-leaf-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <Link
          href={`/plants/${plant.id}`}
          className="text-lg font-semibold text-leaf-700 hover:underline"
        >
          🌱 {plant.name}
        </Link>
        {plant.due ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
            물 줄 시간!
          </span>
        ) : (
          <span className="rounded-full bg-leaf-100 px-2 py-0.5 text-xs text-leaf-700">
            {plant.daysUntil}일 후
          </span>
        )}
      </div>

      <dl className="mt-3 space-y-1 text-sm text-gray-600">
        <div className="flex justify-between">
          <dt>심은 날짜</dt>
          <dd>{plant.plantedDate}</dd>
        </div>
        <div className="flex justify-between">
          <dt>물 주기</dt>
          <dd>{plant.wateringIntervalDays}일마다</dd>
        </div>
        <div className="flex justify-between">
          <dt>다음 물 주기</dt>
          <dd className={plant.due ? "font-semibold text-red-600" : ""}>
            {plant.nextWatering}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex gap-2">
        <button
          onClick={water}
          disabled={loading}
          className="flex-1 rounded bg-leaf-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-leaf-600 disabled:opacity-50"
        >
          💧 물 줬어요
        </button>
        <Link
          href={`/plants/${plant.id}`}
          className="rounded border border-leaf-200 px-3 py-1.5 text-sm text-leaf-700 hover:bg-leaf-50"
        >
          일지
        </Link>
        <button
          onClick={remove}
          disabled={loading}
          className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
