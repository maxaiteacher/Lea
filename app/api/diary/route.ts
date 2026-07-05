import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const plantIdStr = req.nextUrl.searchParams.get("plantId");
  const where = plantIdStr ? { plantId: Number(plantIdStr) } : {};
  const entries = await prisma.diaryEntry.findMany({
    where,
    orderBy: { date: "desc" },
  });
  return NextResponse.json(entries);
}

const createSchema = z.object({
  plantId: z.coerce.number().int().positive(),
  memo: z.string().min(1, "메모를 입력하세요."),
  date: z.string().optional(),
  photoPath: z.string().optional(),
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
  const { plantId, memo, date, photoPath } = parsed.data;

  // 식물 존재 확인
  const plant = await prisma.plant.findUnique({ where: { id: plantId } });
  if (!plant) {
    return NextResponse.json(
      { error: "식물을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  const entry = await prisma.diaryEntry.create({
    data: {
      plantId,
      memo,
      date: date ? new Date(date) : new Date(),
      photoPath: photoPath || null,
    },
  });
  return NextResponse.json(entry, { status: 201 });
}
