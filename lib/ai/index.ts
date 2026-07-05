import { claudeProvider } from "./claude";
import { openaiProvider } from "./openai";
import type { AIProvider } from "./types";

export * from "./types";

export function hasOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
export function hasAnthropicKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * provider 선택 규칙 (실제 있는 키 우선 — 초보자 친화적):
 * 1) AI_PROVIDER 가 명시됐고 그 provider의 키가 있으면 그대로 사용.
 * 2) 그 외에는 실제로 존재하는 키 쪽을 사용(OpenAI 우선).
 * 3) 아무 키도 없으면, 명시값(있으면) 아니면 기본값 claude로 안내 메시지 유도.
 * → AI_PROVIDER를 claude로 잘못 둬도 OpenAI 키만 있으면 OpenAI로 동작한다.
 */
export function getAIProvider(): AIProvider {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  const openai = hasOpenAIKey();
  const claude = hasAnthropicKey();

  if (explicit === "openai" && openai) return openaiProvider;
  if (explicit === "claude" && claude) return claudeProvider;

  if (openai) return openaiProvider;
  if (claude) return claudeProvider;

  return explicit === "openai" ? openaiProvider : claudeProvider;
}
