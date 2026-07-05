/**
 * 모델이 돌려준 텍스트에서 JSON을 안전하게 추출/파싱한다.
 * ```json ... ``` 코드펜스나 앞뒤 잡텍스트가 섞여 있어도 처리한다.
 */
export function extractJson<T>(text: string): T {
  const trimmed = text.trim();

  // 코드펜스 제거
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(candidate) as T;
  } catch {
    // 첫 { 또는 [ 부터 마지막 } 또는 ] 까지 잘라서 재시도
    const start = candidate.search(/[[{]/);
    const end = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1)) as T;
    }
    throw new Error("AI 응답을 JSON으로 파싱하지 못했습니다.");
  }
}
