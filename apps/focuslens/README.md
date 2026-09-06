# FocusLens

Vercel에 배포하고 Supabase의 데이터베이스·인증·스토리지를 사용하는 Next.js 앱입니다.
저장소 루트의 식물 관리 앱(`Lea`)과는 독립적으로 동작하며, 각자 별도의 Vercel
프로젝트로 배포합니다.

## 구성

| 영역 | 사용 기술 | 관련 파일 |
| --- | --- | --- |
| 프레임워크 | Next.js 15 (App Router) · TypeScript · Tailwind CSS | `app/`, `tailwind.config.ts` |
| 인증 | Supabase Auth (이메일·비밀번호) | `app/login/`, `app/auth/`, `middleware.ts` |
| 데이터베이스 | Supabase PostgreSQL + RLS | `app/notes/`, `supabase/migrations/` |
| 스토리지 | Supabase Storage (비공개 버킷) | `app/files/` |

Supabase 클라이언트는 실행 위치에 따라 세 가지로 나누어 두었습니다.

- `lib/supabase/client.ts` — 브라우저(클라이언트 컴포넌트)에서 사용합니다.
- `lib/supabase/server.ts` — 서버 컴포넌트·서버 액션·Route Handler에서 사용합니다.
- `lib/supabase/admin.ts` — RLS를 우회하는 관리자 작업에만 사용합니다. `server-only`
  가 붙어 있어 클라이언트 컴포넌트에서 가져다 쓰면 빌드가 실패합니다.

`middleware.ts` 는 매 요청마다 액세스 토큰을 갱신하고, 로그인이 필요한 경로
(`/notes`, `/files`)를 보호합니다.

## 1단계 — Supabase 준비

1. Supabase 대시보드에서 프로젝트를 엽니다.
2. **SQL Editor** 에서 `supabase/migrations/0001_init.sql` 의 내용을 붙여 넣고
   실행합니다. `notes` 테이블, RLS 정책, 비공개 `uploads` 버킷과 스토리지 정책이
   한 번에 만들어집니다. 여러 번 실행해도 안전합니다.
3. **Project Settings → API** 에서 아래 두 값을 복사해 둡니다.
   - Project URL
   - Publishable key(`sb_publishable_...`) 또는 예전 표기의 anon public key(`eyJ...`)

> 이메일 확인을 끄고 바로 로그인해 보려면 **Authentication → Sign In / Providers →
> Email** 에서 "Confirm email" 을 잠시 꺼 두면 편합니다.

## 2단계 — 로컬 실행

```bash
cd apps/focuslens
npm install

cp .env.example .env.local
#   .env.local 에 위에서 복사한 URL과 키를 붙여 넣습니다.

npm run dev     # http://localhost:3000
```

첫 화면에서 환경변수·Auth·데이터베이스·스토리지 연결 상태를 각각 확인할 수 있습니다.

## 3단계 — Vercel 배포

이 앱은 저장소 루트가 아니라 하위 디렉터리에 있으므로, **Root Directory** 설정이
가장 중요합니다.

1. [vercel.com/new](https://vercel.com/new) 에서 이 저장소를 Import 합니다.
   (루트의 기존 앱이 이미 연결되어 있어도, 같은 저장소로 프로젝트를 하나 더 만들 수
   있습니다.)
2. **Root Directory** 를 `apps/focuslens` 으로 지정합니다. Framework Preset은 Next.js로
   자동 인식됩니다.
3. **Environment Variables** 에 아래 값을 추가합니다. Production·Preview·Development
   세 환경 모두에 넣어야 미리보기 배포에서도 동작합니다.

   | 이름 | 값 |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable(anon) key |
   | `SUPABASE_SERVICE_ROLE_KEY` | (선택) Secret / service_role key |

4. **Deploy** 를 누릅니다.
5. 배포가 끝나면 Supabase 대시보드의 **Authentication → URL Configuration** 으로
   돌아가, 배포된 주소를 등록합니다.
   - Site URL: `https://<프로젝트>.vercel.app`
   - Redirect URLs: `https://<프로젝트>.vercel.app/auth/callback`,
     `https://<프로젝트>-*.vercel.app/auth/callback` (미리보기 배포용),
     `http://localhost:3000/auth/callback` (로컬 개발용)

`NEXT_PUBLIC_` 으로 시작하는 값은 빌드 시점에 코드에 새겨지므로, 값을 바꾼 뒤에는
반드시 다시 배포해야 반영됩니다.

### 루트 앱이 불필요하게 재배포되지 않게 하려면

두 앱이 한 저장소에 있으므로, 기본 설정에서는 어느 쪽을 고쳐도 두 프로젝트가 모두
빌드됩니다. 각 Vercel 프로젝트의 **Settings → Git → Ignored Build Step** 에 아래
명령을 넣으면 자기 디렉터리가 바뀔 때만 배포합니다.

- `apps/focuslens` 프로젝트: `git diff --quiet HEAD^ HEAD -- apps/focuslens`
- 루트 프로젝트: `git diff --quiet HEAD^ HEAD -- ':!apps'`

## 배포 후 점검

- `/` — 환경변수·Auth·데이터베이스·스토리지 연결 상태를 화면에서 확인합니다.
- `/api/health` — 같은 내용을 JSON으로 돌려줍니다. 키 값 자체는 응답에 담지 않고
  설정 여부만 알려 주므로, 배포가 실패했을 때 원인을 좁히기 좋습니다.

## 새 테이블을 추가할 때

`supabase/migrations/` 에 SQL 파일을 추가하고 SQL Editor에서 실행합니다. 이때
**새 테이블마다 RLS를 켜고 정책을 함께 만들어야 합니다.** RLS 없이 테이블을 만들면
공개 키만으로 모든 사용자의 데이터를 읽을 수 있게 됩니다. 작성 방식은
`0001_init.sql` 의 `notes` 테이블 부분을 그대로 따라 하면 됩니다.
