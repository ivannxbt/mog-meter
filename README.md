# MOG Meter

**Who's the Male Of the Group?** Single-page app: upload a WhatsApp or Teams screenshot, get a sarcastic “official” alpha verdict. Entertainment only — not a real assessment.

## Workstreams

| Area | Path | Owner |
|------|------|--------|
| Shared contract | [`lib/types.ts`](lib/types.ts) | Platform |
| Platform limits | [`lib/config.ts`](lib/config.ts) | Platform |
| Assembly + state machine | [`app/page.tsx`](app/page.tsx) | Platform |
| API (mock → LLM) | [`app/api/evaluate-alpha/route.ts`](app/api/evaluate-alpha/route.ts) | Platform mock / Backend |
| Upload UI slot | [`components/upload/UploadPanel.tsx`](components/upload/UploadPanel.tsx) | Frontend #3 |
| Verdict UI slot | [`components/verdict/VerdictCard.tsx`](components/verdict/VerdictCard.tsx) | Frontend #4 |

Spec: [`PRD.md`](PRD.md) · QA checklist: [`docs/TEST-PLAN.md`](docs/TEST-PLAN.md) · Notes: [`LEARN.md`](LEARN.md)

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Mock triggers (no OpenAI required)

| Trigger | How |
|---------|-----|
| Default verdict | Upload any PNG/JPEG/WebP ≤ 8 MB |
| Low confidence | Put `mock:lowsignal` in context |
| LLM error | Put `mock:error` in context |
| Query override | `POST /api/evaluate-alpha?mock=lowsignal` |

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Prod | Rate limiting (10 req / 5 min / IP) |
| `UPSTASH_REDIS_REST_TOKEN` | Prod | Rate limiting |
| `OPENAI_API_KEY` | When LLM live | Backend workstream |
| `OPENAI_MODEL` | Optional | Default `gpt-4.1-mini` |

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```

## Deploy en Vercel

1. Push repo and import in [Vercel](https://vercel.com/new).
2. Framework preset: **Next.js** (auto-detected).
3. Add environment variables from `.env.example`:
   - **Production:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
   - When Backend is ready: `OPENAI_API_KEY`, optional `OPENAI_MODEL`
4. **Upstash:** install [Upstash integration](https://vercel.com/integrations/upstash) on the project to auto-inject Redis credentials.
5. Deploy. Smoke test preview URL with one image upload.
6. Confirm rate limit: 11 rapid POSTs from same IP → `429` with `RATE_LIMITED`.

API route uses `runtime = nodejs` and `maxDuration = 30` for future `sharp` + LLM work.

## Privacy

Images are processed in memory for each request; the mock does not persist uploads. Do not log image bytes or verdict text in production (see PRD NFR-8).
