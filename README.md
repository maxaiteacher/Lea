# 🌿 Lea — 식물 키우기 & 요리 도우미

식물을 등록·관리하고, 물 주기 알림과 성장 일지를 기록하며, AI로 식물 추천·상담·레시피를
받을 수 있는 웹 앱입니다. Next.js 풀스택(App Router) 한 저장소로 구성되어 팀 협업에
적합합니다.

## 주요 기능

| 기능 | 설명 | 위치 |
| --- | --- | --- |
| 식물 등록 | 이름·심은 날짜·물 주기 간격 입력 | `/plants/new` |
| 물 주기 알림 | 마지막 물 준 날 + 간격으로 다음 물주기 계산, 홈에서 "물 줬어요"로 갱신 | `/` |
| 성장 일지 | 식물별 메모 + 사진 첨부 기록 | `/plants/[id]` |
| AI 식물 추천 | 지역·계절·관리시간·수준 → 추천 식물 3~5개 | `/recommend` |
| AI 식물 상담 | 챗봇 형태 상담 | `/consult` |
| AI 레시피 추천 | 수확 가능 재료 → 추천 요리 | `/recipes` |

## 기술 스택

- **프론트+백엔드**: Next.js 14 (App Router) · TypeScript · Tailwind CSS
- **DB**: SQLite + Prisma (사진은 서버 로컬 `public/uploads/`에 저장)
- **AI**: Claude(기본) / OpenAI 를 환경변수로 전환 (`lib/ai/`)

## 실행 방법

```bash
# 1) 의존성 설치
npm install

# 2) 환경변수 설정
cp .env.example .env
#   .env 를 열어 AI_PROVIDER 와 API 키를 입력하세요.

# 3) DB 스키마 생성
npx prisma migrate dev --name init

# 4) (선택) 샘플 식물 3개 넣기
npm run seed

# 5) 개발 서버 실행
npm run dev
# http://localhost:3000
```

## 환경변수 (.env)

| 변수 | 설명 |
| --- | --- |
| `AI_PROVIDER` | `claude`(기본) 또는 `openai` |
| `ANTHROPIC_API_KEY` | Claude 사용 시 필요 (모델: `claude-opus-4-8`) |
| `OPENAI_API_KEY` | OpenAI 사용 시 필요 (모델: `gpt-4o`) |
| `DATABASE_URL` | 기본 `file:./dev.db` |

> API 키가 없어도 앱은 실행됩니다. AI 기능 호출 시 키가 없으면 안내 메시지를 반환합니다.

## 팀 역할 분담

| 담당 | 영역 | 주요 파일 |
| --- | --- | --- |
| 프론트 1 | 메인·식물 등록 화면 | `app/page.tsx`, `app/plants/new/`, `components/PlantCard.tsx` |
| 프론트 2 | 일지·레시피 화면 | `app/plants/[id]/`, `app/recipes/`, `components/DiaryForm.tsx` |
| 백엔드 3 | 데이터 저장·물 주기 계산 | `prisma/`, `app/api/plants/`, `app/api/diary/`, `app/api/upload/`, `lib/watering.ts` |
| AI 4 | GPT/Claude 추천·상담·레시피 | `lib/ai/`, `app/api/ai/` |

## 프로젝트 구조

```
app/
 ├─ page.tsx              메인/대시보드
 ├─ plants/new/           식물 등록
 ├─ plants/[id]/          상세 + 일지
 ├─ recommend/            AI 식물 추천
 ├─ consult/              AI 상담 챗봇
 ├─ recipes/              AI 레시피 추천
 └─ api/                  백엔드 API Routes
lib/
 ├─ db.ts                 Prisma 클라이언트
 ├─ watering.ts           물 주기 계산
 └─ ai/                   AI provider 추상화 (claude/openai)
prisma/schema.prisma      DB 스키마
components/               재사용 UI
```
