# MindWell

MindWell is a wellness-focused mobile app stack with:
- **Frontend**: Expo + React Native app (`/frontend`)
- **Backend**: Express API + Supabase integration (`/backend`)
- **AI Proxy**: FreeLLM API workspace for provider key management/proxying (`/freellmapi`)

## Repository structure

- `/frontend` — Expo app (auth, tabs, personalization, nutrition, biometrics, leaderboard)
- `/backend` — Express API (auth, profile, guide settings, biometrics, nutrition, leaderboard, chat, AI)
- `/freellmapi` — Node workspaces:
  - `/freellmapi/server` — API key + proxy server
  - `/freellmapi/client` — admin UI
  - `/freellmapi/shared` — shared package

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase project (URL, anon key, service role key)

## Environment variables

### Backend (`/backend/.env`)

```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FREELLM_API_KEY=your_provider_api_key
FREELLM_PROXY_URL=http://localhost:3001/v1/chat/completions
```

### Frontend (`/frontend/.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_BACKEND_URL=http://localhost:5000
```

### FreeLLM proxy (`/freellmapi/.env`)

Copy `/freellmapi/.env.example` to `.env` and set:

```env
ENCRYPTION_KEY=your_64_char_hex_key
PORT=3001
```

## Install dependencies

```bash
# Backend
cd /home/runner/work/mindwell/mindwell/backend && npm install

# Frontend
cd /home/runner/work/mindwell/mindwell/frontend && npm install

# FreeLLM workspace
cd /home/runner/work/mindwell/mindwell/freellmapi && npm install
```

## Run locally

Open separate terminals:

```bash
# 1) FreeLLM proxy server + client
cd /home/runner/work/mindwell/mindwell/freellmapi && npm run dev

# 2) MindWell backend API
cd /home/runner/work/mindwell/mindwell/backend && npm run dev

# 3) MindWell mobile app (Expo)
cd /home/runner/work/mindwell/mindwell/frontend && npm run dev
```

## Useful commands

### Frontend

```bash
cd /home/runner/work/mindwell/mindwell/frontend
npm run dev
npm run lint
npm run typecheck
npm run build:web
```

### Backend

```bash
cd /home/runner/work/mindwell/mindwell/backend
npm run dev
npm start
```

### FreeLLM API workspace

```bash
cd /home/runner/work/mindwell/mindwell/freellmapi
npm run dev
npm run build
npm run test
```

## API overview (backend)

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET/PATCH /api/profile`
- `GET/PUT /api/guide-settings`
- `GET /api/biometrics`
- `GET /api/nutrition`
- `GET /api/leaderboard`
- `GET /api/chat/history`
- `POST /api/chat/message`
- `POST /api/ai/chat`

Most `/api/*` routes (except auth) require a bearer token in the `Authorization` header.

## Notes

- The frontend authenticates directly with Supabase.
- The backend uses a **service role key**; keep it server-only.
- The AI route (`/api/ai/chat`) proxies requests using `FREELLM_PROXY_URL`.
