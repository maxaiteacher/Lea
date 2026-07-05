import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AIConfigError, getAIProvider } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      })
    )
    .min(1, "메시지를 입력하세요."),
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
    const reply = await getAIProvider().consult(parsed.data.messages);
    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof AIConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error(err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `답변 오류: ${detail}` },
      { status: 500 }
    );
  }
}
