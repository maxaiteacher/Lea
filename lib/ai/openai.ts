import OpenAI from "openai";
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

const MODEL = "gpt-4o";

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AIConfigError(
      "OPENAI_API_KEY가 설정되지 않았습니다. .env 파일에 키를 넣거나 AI_PROVIDER를 claude로 바꿔 주세요."
    );
  }
  return new OpenAI({ apiKey });
}

export const openaiProvider: AIProvider = {
  async recommendPlants(
    input: RecommendInput
  ): Promise<PlantRecommendation[]> {
    const client = getClient();
    const res = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "당신은 도시 텃밭·실내 재배 전문가입니다. JSON으로만 응답하세요. " +
            '형식: {"plants":[{"name":"...","reason":"..."}]}',
        },
        { role: "user", content: recommendUserPrompt(input) },
      ],
    });
    const text = res.choices[0]?.message?.content ?? "{}";
    const { plants } = extractJson<{ plants: PlantRecommendation[] }>(text);
    return plants;
  },

  async consult(messages: ChatMessage[]): Promise<string> {
    const client = getClient();
    const res = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: CONSULT_SYSTEM },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });
    return (res.choices[0]?.message?.content ?? "").trim();
  },

  async recommendRecipes(
    ingredients: string[]
  ): Promise<RecipeRecommendation[]> {
    const client = getClient();
    const res = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "당신은 가정 요리 전문가입니다. JSON으로만 응답하세요. " +
            '형식: {"recipes":[{"dish":"...","description":"..."}]}',
        },
        { role: "user", content: recipeUserPrompt(ingredients) },
      ],
    });
    const text = res.choices[0]?.message?.content ?? "{}";
    const { recipes } = extractJson<{ recipes: RecipeRecommendation[] }>(text);
    return recipes;
  },
};
