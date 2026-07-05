export type Level = "초보" | "중급" | "고급";

export interface RecommendInput {
  region: string;
  season: string;
  dailyMinutes: number;
  level: Level;
}

export interface PlantRecommendation {
  name: string;
  reason: string;
}

export interface RecipeRecommendation {
  dish: string;
  description: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIProvider {
  recommendPlants(input: RecommendInput): Promise<PlantRecommendation[]>;
  consult(messages: ChatMessage[]): Promise<string>;
  recommendRecipes(ingredients: string[]): Promise<RecipeRecommendation[]>;
}

/** API 키가 설정되지 않았을 때 던지는 에러 (라우트에서 안내 메시지로 변환) */
export class AIConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIConfigError";
  }
}
