import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseId(idStr: string): number | null {
  const id = Number(idStr);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }
  const plant = await prisma.plant.findUnique({
    where: { id },
    include: { diaryEntries: { orderBy: { date: "desc" } } },
  });
  if (!plant) {
    return NextResponse.json(
      { error: "식물을 찾을 수 없습니다." },
      { status: 404 }
    );
  }
  return NextResponse.json(plant);
}

const patchSchema = z.object({
  // "물 줌" 액션
  water: z.boolean().optional(),
  // 정보 수정 (선택)
  name: z.string().min(1).optional(),
  wateringIntervalDays: z.coerce.number().int().min(1).max(60).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "잘못된 입력입니다." },
      { status: 400 }
    );
  }
  const { water, name, wateringIntervalDays } = parsed.data;

  const data: Record<string, unknown> = {};
  if (water) data.lastWateredDate = new Date();
  if (name !== undefined) data.name = name;
  if (wateringIntervalDays !== undefined)
    data.wateringIntervalDays = wateringIntervalDays;

  try {
    const plant = await prisma.plant.update({ where: { id }, data });
    return NextResponse.json(plant);
  } catch {
    return NextResponse.json(
      { error: "식물을 찾을 수 없습니다." },
      { status: 404 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: "잘못된 ID입니다." }, { status: 400 });
  }
  try {
    await prisma.plant.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "식물을 찾을 수 없습니다." },
      { status: 404 }
    );
  }
}
