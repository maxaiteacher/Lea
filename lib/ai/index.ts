import { claudeProvider } from "./claude";
import { openaiProvider } from "./openai";
import type { AIProvider } from "./types";

export * from "./types";

/**
 * provider 선택 규칙:
 * 1) AI_PROVIDER 가 명시돼 있으면 그대로 사용("openai" | "claude").
 * 2) 명시가 없으면 키 존재로 자동 감지:
 *    - OpenAI 키만 있으면 OpenAI, Claude 키만 있으면 Claude.
 * 3) 둘 다/아무것도 없으면 기본값 "claude".
 * → Vercel에 OPENAI_API_KEY 만 넣어도 AI_PROVIDER 설정 없이 동작한다.
 */
export function getAIProvider(): AIProvider {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === "openai") return openaiProvider;
  if (explicit === "claude") return claudeProvider;

  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasClaude = !!process.env.ANTHROPIC_API_KEY;
  if (hasOpenAI && !hasClaude) return openaiProvider;
  if (hasClaude && !hasOpenAI) return claudeProvider;

  return claudeProvider; // 기본값
}
