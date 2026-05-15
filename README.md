# KUCCTHON

Team 3: Wild Newbies의 2026 KUCC 해커톤 프로젝트입니다. 이 저장소는 아직 기능 구현 단계가 아니라, Next.js, Supabase, Vercel 기반 MVP를 안정적으로 개발하기 위한 초기 개발 기반입니다.

## 현재 범위

- 포함: 프로젝트 scaffold, 버전 고정, npm lockfile, lint/format/typecheck/test/build, GitHub Actions, PR 템플릿, 환경 변수 표준
- 제외: 실제 기능 페이지, Supabase DB schema, Realtime 구독, UI/UX 상세 구현, PWA, 배포 자동화 완성

`src` 내부는 빌드 검증을 위한 최소 Next.js 파일만 포함합니다. 기능 구조는 MVP 구현 단계에서 별도로 확정합니다.

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
```

Supabase CLI 명령은 패키지에 고정된 CLI를 사용합니다.

```bash
npm run supabase:start
npm run supabase:stop
npm run supabase:reset
npm run db:types
```

## 환경 변수

`.env.local`은 커밋하지 않습니다. 새 환경은 항상 `.env.example`에서 복사해서 시작합니다.

```bash
cp .env.example .env.local
```

현재 필요한 공개 환경 변수:

| 이름                            | 설명                  |
| ------------------------------- | --------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key     |
| `NEXT_PUBLIC_APP_URL`           | 로컬 또는 배포 앱 URL |

서버 전용 secret은 `NEXT_PUBLIC_` prefix를 붙이지 않습니다. `SUPABASE_SERVICE_ROLE_KEY`는 필요한 경우 서버 환경에서만 사용하고, 클라이언트 코드에 노출하지 않습니다.

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
5. Environment Variables에 `.env.example` 기준 값을 등록합니다.

## 버전 고정 정책

- npm과 `package-lock.json`을 기준으로 사용합니다.
- `.npmrc`의 `save-exact=true`로 새 dependency도 exact version으로 저장합니다.
- `.nvmrc`와 `package.json engines`가 일치해야 합니다.
- 로컬 스크립트는 `scripts/run_with_npm_version.sh`를 통해 Node/npm 버전을 검증합니다.
