import Link from "next/link";
import { notFound } from "next/navigation";
import DiaryForm from "@/components/DiaryForm";
import { prisma } from "@/lib/db";
import { formatDate, getNextWatering, isDue } from "@/lib/watering";

export const dynamic = "force-dynamic";

export default async function PlantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const plant = await prisma.plant.findUnique({
    where: { id },
    include: { diaryEntries: { orderBy: { date: "desc" } } },
  });
  if (!plant) notFound();

  const next = getNextWatering(
    plant.lastWateredDate,
    plant.wateringIntervalDays
  );
  const due = isDue(plant.lastWateredDate, plant.wateringIntervalDays);

  return (
    <div>
      <Link href="/" className="text-sm text-leaf-600 hover:underline">
        ← 목록으로
      </Link>

      <div className="mt-3 rounded-lg border border-leaf-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-leaf-700">🌱 {plant.name}</h1>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Info label="심은 날짜" value={formatDate(plant.plantedDate)} />
          <Info label="물 주기" value={`${plant.wateringIntervalDays}일마다`} />
          <Info
            label="마지막 물 준 날"
            value={formatDate(plant.lastWateredDate)}
          />
          <Info
            label="다음 물 주기"
            value={formatDate(next)}
            highlight={due}
          />
        </div>
        {due && (
          <p className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            💧 오늘 물 줄 시간이에요! 홈에서 "물 줬어요"를 눌러 기록하세요.
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-leaf-700">
            📔 성장 일지
          </h2>
          {plant.diaryEntries.length === 0 ? (
            <p className="rounded-lg border border-dashed border-leaf-200 bg-white p-6 text-center text-sm text-gray-500">
              아직 기록이 없어요. 오른쪽에서 첫 기록을 남겨보세요.
            </p>
          ) : (
            <ul className="space-y-3">
              {plant.diaryEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-lg border border-leaf-100 bg-white p-4 shadow-sm"
                >
                  <p className="text-xs text-gray-500">
                    {formatDate(entry.date)}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">
                    {entry.memo}
                  </p>
                  {entry.photoPath && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.photoPath}
                      alt="일지 사진"
                      className="mt-2 max-h-56 rounded object-cover"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-leaf-700">✍️ 기록하기</h2>
          <DiaryForm plantId={plant.id} />
        </div>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd
        className={`font-medium ${highlight ? "text-red-600" : "text-gray-800"}`}
      >
        {value}
      </dd>
    </div>
  );
}
