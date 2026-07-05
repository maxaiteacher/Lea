import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AIConfigError, getAIProvider } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  region: z.string().min(1, "거주 지역을 입력하세요."),
  season: z.string().min(1, "계절을 선택하세요."),
  dailyMinutes: z.coerce.number().int().min(1).max(600),
  level: z.enum(["초보", "중급", "고급"]),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "잘못된 입력입니다." },
      { status: 400 }
    );
  }
  try {
    const plants = await getAIProvider().recommendPlants(parsed.data);
    return NextResponse.json({ plants });
  } catch (err) {
    if (err instanceof AIConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error(err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `추천 오류: ${detail}` },
      { status: 500 }
    );
  }
}
