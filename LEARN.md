# MOG Meter — What we learned building the platform layer

Think of MOG Meter like a food truck that only sells one joke: you hand us a screenshot of your group chat, and we hand back a fake “corporate alpha report.” The **platform workstream** built the parking spot, the menu format, and a practice kitchen that serves plastic food—so the real chefs (upload UI, verdict UI, OpenAI backend) can swap in without redesigning the plate.

## Architecture in plain language

```
Browser (app/page.tsx)
    → POST multipart → /api/evaluate-alpha
                           ├─ rate limit (Upstash)
                           ├─ validate file (types.ts rules)
                           └─ mock verdict OR (later) OpenAI
    ← JSON AlphaVerdict | ApiErrorResponse
    → VerdictCard or error slot
```

**`lib/types.ts`** is the contract. Everyone types against `AlphaVerdict`, `ApiErrorCode`, and `EvaluateRequestFields`. Changing a field name there is like changing the shape of the plate—every station breaks until they adapt.

**`lib/config.ts`** holds platform limits: 10 requests per 5 minutes per IP, max 1500 output tokens, images downscaled to 1536px before the LLM (when Backend lands). The mock doesn’t call OpenAI but still enforces rate limits and file validation.

**`app/page.tsx`** is the only assembly point. It owns UI state (`idle | loading | result | error`) and never imports OpenAI. That isolation is what lets five people work in parallel.

## Why a mock API first?

Parallel work is a traffic problem. If Frontend waits for the LLM route, everyone queues behind one person. The mock:

- Validates the same rules as production (PNG/JPEG/WebP, 8 MB, image required)
- Returns fixtures for happy path and low-signal (`mock:lowsignal`, `mock:error`)
- Simulates ~700 ms latency so loading states feel real

When Backend replaces the fixture block with `responses.create`, **`lib/types.ts` stays the same**—the frontend doesn’t know anything changed.

## Rate limiting: why Upstash?

On Vercel, each request might hit a different serverless instance. An in-memory counter in one instance doesn’t see requests on another—like having five bouncers who don’t talk to each other. **Upstash Redis** is the shared notebook: 10 evaluations per IP per 5 minutes.

- **Dev without Redis:** rate limit is skipped (permissive) so you can iterate locally.
- **Prod without Redis:** fail closed with `503`—better than unlimited spend on someone’s API key.

## Cost ceiling (not spent yet in mock)

The mock doesn’t burn tokens, but `COST_CEILING` in `lib/config.ts` documents what Backend must enforce:

- `maxOutputTokens: 1500`
- Image `detail: "low"` and max long edge 1536px after `sharp`

That’s the guardrail against a 4K screenshot eating your lunch money.

## Pitfalls we avoided

1. **Treating low confidence as an error** — PRD says `200` with low `confidence` and honest `limits`. The assembly page routes that to `result`, not `error`.
2. **Logging screenshots** — Only log `durationMs`, `intensity`, and a confidence bucket in dev. Never log image bytes or full roasts in production telemetry.
3. **Editing Frontend slots from Platform** — `UploadPanel` and `VerdictCard` are placeholders with a fixed props contract. Platform owns the shell; Frontend owns the interior.

## Workstream map

| # | Owner | Delivers |
|---|--------|----------|
| 1 | Backend/LLM | Real OpenAI route, sharp, prompts |
| 3 | Frontend | UploadDropzone |
| 4 | Frontend | VerdictCard + ErrorState |
| **5** | **Platform/QA** | **types, config, mock, page, rate limit, deploy docs, this file** |

## Local commands

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`, upload any small PNG, get Roberto as your alpha.

## Deploy (Vercel)

See [README.md](./README.md#deploy-en-vercel). Minimum prod env: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. Add `OPENAI_API_KEY` when Backend goes live.
