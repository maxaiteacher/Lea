import { NextResponse } from "next/server";
import { hasAnthropicKey, hasOpenAIKey } from "@/lib/ai";

export const dynamic = "force-dynamic";

// 진단용: 실제 키 값은 노출하지 않고, 어떤 provider/키가 잡히는지만 반환.
export async function GET() {
  const openai = hasOpenAIKey();
  const claude = hasAnthropicKey();
  const aiProviderEnv = process.env.AI_PROVIDER ?? "(미설정)";

  let effectiveProvider: string;
  if (openai) effectiveProvider = "openai";
  else if (claude) effectiveProvider = "claude";
  else effectiveProvider = "(키 없음)";

  return NextResponse.json({
    aiProviderEnv,
    hasOpenAIKey: openai,
    hasAnthropicKey: claude,
    effectiveProvider,
    ok: openai || claude,
    hint: openai || claude
      ? "AI 키 인식됨. 이제 추천/상담/레시피가 동작해야 합니다."
      : "AI 키가 함수에 잡히지 않았습니다. Vercel Settings→Environment Variables에서 OPENAI_API_KEY를 확인하고, Production 환경에 적용했는지 본 뒤 재배포하세요.",
  });
}
