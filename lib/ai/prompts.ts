import type { RecommendInput } from "./types";

export const CONSULT_SYSTEM =
  "당신은 친절한 식물 재배 전문가입니다. 사용자가 키우는 식물의 상태(잎 색, 시듦, 벌레 등)에 대해 " +
  "질문하면, 가능한 원인과 구체적인 해결 방법을 한국어로 이해하기 쉽게 설명해 주세요. " +
  "확실하지 않을 때는 여러 가능성을 제시하고, 답변은 간결하게 유지하세요.";

export function recommendUserPrompt(input: RecommendInput): string {
  return (
    `다음 조건에 맞춰 집에서 키우기 좋은 식물(채소/허브 위주) 3~5개를 추천해 주세요.\n` +
    `- 거주 지역: ${input.region}\n` +
    `- 현재 계절: ${input.season}\n` +
    `- 하루 관리 가능 시간: 약 ${input.dailyMinutes}분\n` +
    `- 재배 수준: ${input.level}\n\n` +
    `각 식물마다 이름(name)과 추천 이유(reason)를 한국어로 제시하세요.`
  );
}

export function recipeUserPrompt(ingredients: string[]): string {
  return (
    `현재 수확 가능한 재료: ${ingredients.join(", ")}\n\n` +
    `이 재료들을 활용해 만들 수 있는 요리 3~5가지를 추천해 주세요. ` +
    `각 요리마다 요리 이름(dish)과 간단한 설명(description)을 한국어로 제시하세요.`
  );
}
