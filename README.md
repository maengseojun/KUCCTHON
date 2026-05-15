# KUCCTHON

2026 KUCC 해커톤 프로젝트입니다.

## 현재 범위

첫 화면은 발표 데모를 고려해 일반 웹 랜딩 페이지가 아니라 모바일 앱 shell처럼 보이도록 유지합니다. 실제 기능 라우트가 추가되기 전까지도 상단바, 앱 카드, 하단 탭의 시각적 기준을 확인할 수 있어야 합니다.

## 필수 도구

- Node.js `22.22.2`
- npm `10.9.7`
- nvm 권장

```bash
nvm install
nvm use
npm install -g npm@10.9.7
```

## 처음 시작하기

```bash
git clone https://github.com/maengseojun/KUCCTHON.git
cd KUCCTHON
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 표준 명령어

```bash
npm run dev           # 로컬 개발 서버
npm run lint          # ESLint 검사
npm run format:check  # Prettier 검사
npm run typecheck     # TypeScript 검사
npm test              # Vitest
npm run build         # Next.js production build
npm run check         # lint + format + typecheck + test
npm run bootstrap     # fresh clone용 bootstrap
npm run env:local     # local Supabase 값을 .env.local에 동기화
```

Supabase CLI 명령은 패키지에 고정된 CLI를 사용합니다.

```bash
npm run supabase:start
npm run supabase:stop
npm run supabase:reset
npm run env:local
npm run db:types
```

## 환경 변수

`.env.local`은 커밋하지 않습니다. 새 환경은 항상 `.env.example`에서 복사해서 시작합니다.

```bash
cp .env.example .env.local
```

현재 필요한 공개 환경 변수:

| 이름                            | 설명                             |
| ------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_APP_ENV`           | `local`, `preview`, `production` |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase 프로젝트 URL            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key                |
| `NEXT_PUBLIC_APP_URL`           | 로컬 또는 배포 앱 URL            |

서버 전용 secret은 `NEXT_PUBLIC_` prefix를 붙이지 않습니다. `SUPABASE_SERVICE_ROLE_KEY`는 필요한 경우 서버 환경에서만 사용하고, 클라이언트 코드에 노출하지 않습니다.

## 환경별 운영 방식

로컬, Vercel Preview, Vercel Production은 같은 코드와 같은 검증 명령을 사용하되 Supabase 프로젝트와 환경 변수는 분리합니다.

| 환경       | 실행 위치                | Supabase                             | `NEXT_PUBLIC_APP_ENV` |
| ---------- | ------------------------ | ------------------------------------ | --------------------- |
| Local      | 개발자 PC                | Supabase CLI local stack             | `local`               |
| Preview    | Vercel PR/branch preview | Preview용 hosted Supabase project    | `preview`             |
| Production | Vercel production        | Production용 hosted Supabase project | `production`          |

로컬 Supabase를 처음 연결할 때는 Docker Desktop을 실행한 뒤 아래 순서로 진행합니다.

```bash
npm run supabase:start
npm run env:local
npm run dev
```

`npm run env:local`은 `supabase status -o env`에서 local API URL과 anon key를 읽어 `.env.local`을 갱신합니다. Docker가 꺼져 있거나 Supabase local stack이 시작되지 않았으면 명확한 에러를 출력합니다.

배포 환경에서는 `.env.local`을 사용하지 않습니다. Vercel dashboard에서 Preview와 Production 환경 변수를 각각 등록합니다.

Preview:

```txt
NEXT_PUBLIC_APP_ENV=preview
NEXT_PUBLIC_APP_URL=https://<vercel-preview-url>
NEXT_PUBLIC_SUPABASE_URL=<preview-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<preview-supabase-anon-key>
```

Production:

```txt
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://<production-domain>
NEXT_PUBLIC_SUPABASE_URL=<production-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-supabase-anon-key>
```

Preview와 Production은 같은 Supabase 프로젝트를 공유하지 않습니다. 해커톤 데모 데이터와 운영 데이터를 섞지 않기 위함입니다.

## Git workflow

기본 브랜치는 `main`입니다. PR 브랜치는 아래 패턴 중 하나를 사용합니다.

- `feature/*`
- `fix/*`
- `chore/*`
- `docs/*`
- `hotfix/*`

PR을 열기 전에 최소한 아래 명령을 실행합니다.

```bash
npm run check
npm run build
```

## CI

GitHub Actions는 `main` push와 `main` 대상 PR에서 실행됩니다.

검증 항목:

- 브랜치 이름 규칙
- `npm ci`
- ESLint
- Prettier format check
- TypeScript typecheck
- Vitest
- Next.js build

## Vercel 연결 가이드

Vercel 프로젝트 연결은 별도 단계에서 진행합니다.

1. Vercel에서 GitHub 저장소 `maengseojun/KUCCTHON`을 import합니다.
2. Framework Preset은 Next.js 자동 감지를 사용합니다.
3. Build Command는 `npm run build`를 사용합니다.
4. Install Command는 `npm ci`를 사용합니다.
5. Environment Variables는 Preview와 Production에 각각 다른 Supabase 값을 등록합니다.
6. 배포 후 `/api/health`가 `{"status":"ok"}`를 반환하는지 확인합니다.

`vercel.json`에도 `npm ci`와 `npm run build`가 명시되어 있어 Vercel dashboard 설정과 저장소 설정이 어긋나지 않도록 합니다.

수동 smoke test가 필요하면 GitHub Actions의 `Preview Smoke` workflow를 실행하고 `preview_url`에 Vercel URL을 넣습니다. 이 workflow는 `/`와 `/api/health`가 200으로 응답하는지만 확인합니다.

## 버전 고정 정책

- npm과 `package-lock.json`을 기준으로 사용합니다.
- `.npmrc`의 `save-exact=true`로 새 dependency도 exact version으로 저장합니다.
- `.nvmrc`와 `package.json engines`가 일치해야 합니다.
- 로컬 스크립트는 `scripts/run_with_npm_version.sh`를 통해 Node/npm 버전을 검증합니다.
