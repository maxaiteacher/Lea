# 🌿 Lea — 식물 키우기 & 요리 도우미

식물을 등록·관리하고, 물 주기 알림과 성장 일지를 기록하며, AI로 식물 추천·상담·레시피를
받을 수 있는 웹 앱입니다. Next.js 풀스택(App Router) 한 저장소로 구성되어 팀 협업에
적합합니다.

## 저장소 구성

이 저장소에는 두 개의 앱이 들어 있고, 각각 별도의 Vercel 프로젝트로 배포합니다.

| 경로 | 앱 | 백엔드 |
| --- | --- | --- |
| 저장소 루트 | Lea — 식물 키우기 & 요리 도우미 (아래 문서) | Prisma + PostgreSQL |
| `apps/focuslens/` | FocusLens — Supabase 연동 앱 | Supabase (DB · Auth · Storage) |

`apps/focuslens` 의 설정과 배포 방법은 [`apps/focuslens/README.md`](apps/focuslens/README.md) 에
따로 정리해 두었습니다.

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
- **DB**: PostgreSQL + Prisma (사진은 base64로 DB에 저장 — 서버리스/Vercel 호환)
- **AI**: Claude(기본) / OpenAI 를 환경변수로 전환 (`lib/ai/`)

## Vercel 배포

1. GitHub 저장소를 Vercel에 Import (이미 완료).
2. **Storage** 탭 → **Create Database** → **Postgres(Neon)** 연결
   → `DATABASE_URL` 환경변수가 자동 등록됩니다.
3. **Settings → Environment Variables** 에 AI 키 추가:
   - Claude: `ANTHROPIC_API_KEY`, `AI_PROVIDER=claude`
   - OpenAI: `OPENAI_API_KEY`, `AI_PROVIDER=openai`
4. **Deployments → Redeploy** (또는 새 커밋 푸시 시 자동 배포).
   빌드 중 `prisma db push`가 DB에 테이블을 자동 생성합니다.

## 로컬 실행

```bash
npm install

cp .env.example .env
#   .env 에 DATABASE_URL(Postgres), AI_PROVIDER, API 키 입력

npx prisma db push     # DB에 테이블 생성
npm run seed           # (선택) 샘플 식물 3개
npm run dev            # http://localhost:3000
```

> 로컬에도 PostgreSQL 연결이 필요합니다(로컬 설치 또는 클라우드 DB URL 사용).

## 환경변수

| 변수 | 설명 |
| --- | --- |
| `DATABASE_URL` | PostgreSQL 연결 문자열 (Vercel Storage 연결 시 자동) |
| `AI_PROVIDER` | `claude`(기본) 또는 `openai` |
| `ANTHROPIC_API_KEY` | Claude 사용 시 (모델: `claude-opus-4-8`) |
| `OPENAI_API_KEY` | OpenAI 사용 시 (모델: `gpt-4o`) |

> API 키가 없어도 앱은 뜹니다. AI 기능 호출 시 키가 없으면 안내 메시지를 반환합니다.

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
