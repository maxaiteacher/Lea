import Anthropic from "@anthropic-ai/sdk";
import { extractJson } from "./json";
import {
  CONSULT_SYSTEM,
  recipeUserPrompt,
  recommendUserPrompt,
} from "./prompts";
import {
  AIConfigError,
  type AIProvider,
  type ChatMessage,
  type PlantRecommendation,
  type RecipeRecommendation,
  type RecommendInput,
} from "./types";

const MODEL = "claude-opus-4-8";

// 어댑티브 사고. SDK 타입 정의가 API를 아직 못 따라올 수 있어 캐스팅한다.
const ADAPTIVE_THINKING = { type: "adaptive" } as unknown as Anthropic.ThinkingConfigParam;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AIConfigError(
      "ANTHROPIC_API_KEY가 설정되지 않았습니다. .env 파일에 키를 넣거나 AI_PROVIDER를 openai로 바꿔 주세요."
    );
  }
  return new Anthropic({ apiKey });
}

/** 응답에서 모든 text 블록을 이어붙인다. */
function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export const claudeProvider: AIProvider = {
  async recommendPlants(
    input: RecommendInput
  ): Promise<PlantRecommendation[]> {
    const client = getClient();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      thinking: ADAPTIVE_THINKING,
      system:
        "당신은 도시 텃밭·실내 재배 전문가입니다. 반드시 JSON만 출력하세요. " +
        '형식: {"plants":[{"name":"...","reason":"..."}]}',
      messages: [
        { role: "user", content: recommendUserPrompt(input) },
      ],
    });
    const { plants } = extractJson<{ plants: PlantRecommendation[] }>(
      textOf(message)
    );
    return plants;
  },

  async consult(messages: ChatMessage[]): Promise<string> {
    const client = getClient();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      thinking: ADAPTIVE_THINKING,
      system: CONSULT_SYSTEM,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    return textOf(message).trim();
  },

  async recommendRecipes(
    ingredients: string[]
  ): Promise<RecipeRecommendation[]> {
    const client = getClient();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      thinking: ADAPTIVE_THINKING,
      system:
        "당신은 가정 요리 전문가입니다. 반드시 JSON만 출력하세요. " +
        '형식: {"recipes":[{"dish":"...","description":"..."}]}',
      messages: [{ role: "user", content: recipeUserPrompt(ingredients) }],
    });
    const { recipes } = extractJson<{ recipes: RecipeRecommendation[] }>(
      textOf(message)
    );
    return recipes;
  },
};
