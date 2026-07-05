import { claudeProvider } from "./claude";
import { openaiProvider } from "./openai";
import type { AIProvider } from "./types";

export * from "./types";

/**
 * 환경변수 AI_PROVIDER 로 provider 선택. 기본값은 "claude".
 * "openai" 로 설정하면 OpenAI 를 사용한다.
 */
export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER ?? "claude").toLowerCase();
  return provider === "openai" ? openaiProvider : claudeProvider;
}
