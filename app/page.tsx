import Link from "next/link";
import PlantCard, { type PlantCardData } from "@/components/PlantCard";
import { prisma } from "@/lib/db";
import { daysUntilWatering, formatDate, getNextWatering, isDue } from "@/lib/watering";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const plants = await prisma.plant.findMany({
    orderBy: { createdAt: "desc" },
  });

  const cards: PlantCardData[] = plants.map((p) => ({
    id: p.id,
    name: p.name,
    plantedDate: formatDate(p.plantedDate),
    wateringIntervalDays: p.wateringIntervalDays,
    lastWateredDate: formatDate(p.lastWateredDate),
    nextWatering: formatDate(
      getNextWatering(p.lastWateredDate, p.wateringIntervalDays)
    ),
    daysUntil: daysUntilWatering(p.lastWateredDate, p.wateringIntervalDays),
    due: isDue(p.lastWateredDate, p.wateringIntervalDays),
  }));

  const dueCount = cards.filter((c) => c.due).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-leaf-700">내 식물</h1>
          <p className="mt-1 text-sm text-gray-600">
            {dueCount > 0
              ? `오늘 물 줄 식물이 ${dueCount}개 있어요 💧`
              : "오늘은 모두 촉촉해요 🌿"}
          </p>
        </div>
        <Link
          href="/plants/new"
          className="rounded bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
        >
          + 식물 등록
        </Link>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-lg border border-dashed border-leaf-200 bg-white p-10 text-center text-gray-500">
          <p>아직 등록한 식물이 없어요.</p>
          <Link
            href="/plants/new"
            className="mt-3 inline-block rounded bg-leaf-500 px-4 py-2 text-sm text-white hover:bg-leaf-600"
          >
            첫 식물 등록하기
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <PlantCard key={c.id} plant={c} />
          ))}
        </div>
      )}
    </div>
  );
}
