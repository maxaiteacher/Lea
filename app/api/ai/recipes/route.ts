import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AIConfigError, getAIProvider } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  ingredients: z
    .array(z.string().min(1))
    .min(1, "재료를 하나 이상 선택하세요."),
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
    const recipes = await getAIProvider().recommendRecipes(
      parsed.data.ingredients
    );
    return NextResponse.json({ recipes });
  } catch (err) {
    if (err instanceof AIConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error(err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `레시피 오류: ${detail}` },
      { status: 500 }
    );
  }
}
