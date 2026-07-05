import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const plants = await prisma.plant.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(plants);
}

const createSchema = z.object({
  name: z.string().min(1, "식물 이름을 입력하세요."),
  plantedDate: z.string().min(1, "심은 날짜를 입력하세요."),
  wateringIntervalDays: z.coerce.number().int().min(1).max(60),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "잘못된 입력입니다." },
      { status: 400 }
    );
  }
  const { name, plantedDate, wateringIntervalDays } = parsed.data;
  const plant = await prisma.plant.create({
    data: {
      name,
      plantedDate: new Date(plantedDate),
      wateringIntervalDays,
      lastWateredDate: new Date(),
    },
  });
  return NextResponse.json(plant, { status: 201 });
}
