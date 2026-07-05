import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.plant.count();
  if (count > 0) {
    console.log("이미 데이터가 있어 seed를 건너뜁니다.");
    return;
  }

  const now = new Date();
  const daysAgo = (d: number) =>
    new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  await prisma.plant.create({
    data: {
      name: "상추",
      plantedDate: daysAgo(20),
      wateringIntervalDays: 3,
      lastWateredDate: daysAgo(2),
      diaryEntries: {
        create: [
          { memo: "잎이 많이 자람. 물 줌.", date: daysAgo(2) },
          { memo: "새싹이 올라왔다.", date: daysAgo(15) },
        ],
      },
    },
  });

  await prisma.plant.create({
    data: {
      name: "대파",
      plantedDate: daysAgo(30),
      wateringIntervalDays: 5,
      lastWateredDate: daysAgo(5),
    },
  });

  await prisma.plant.create({
    data: {
      name: "바질",
      plantedDate: daysAgo(10),
      wateringIntervalDays: 2,
      lastWateredDate: daysAgo(1),
    },
  });

  console.log("샘플 식물 3개(상추/대파/바질)를 추가했습니다.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
