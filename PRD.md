# MOG Meter — Product Requirements Document

| Field | Value |
|-------|-------|
| **Product name** | MOG Meter (a.k.a. "Evaluador Macho Alfa") |
| **Tagline** | *Who's the Male Of the Group? Find out. Regret nothing.* |
| **Version** | 0.1 (Draft) |
| **Date** | 2026-06-02 |
| **Status** | Draft — pending engineering kickoff |
| **Owner** | Iván Caamaño |
| **Document language** | English |
| **Verdict language (product output)** | Spanish / Spanglish |

> **Disclaimer (read first):** MOG Meter is **entertainment**, not a psychological,
> behavioral, or scientific assessment. It analyzes only *visible interaction behavior* in a
> screenshot and returns a deliberately exaggerated, comedic verdict. It does **not** judge
> appearance, gender, race, age, attractiveness, disability, or any protected/personal trait.

---

## 1. Overview / Elevator Pitch

MOG Meter is a single-page web app where a user uploads **one screenshot** of a WhatsApp or
Microsoft Teams group conversation/meeting and instantly receives a **sarcastic, funny verdict**
naming the "alpha" (MOG — Male Of the Group) of that interaction. The verdict is delivered as a
mock-serious "official report": a winner, a podium ranking, tongue-in-cheek "evidence", a
confidence score, and a ridiculous corporate award title. The whole experience takes seconds,
runs entirely in memory (nothing is stored), and is built around one job: **make people laugh at
their own group dynamics.**

---

## 2. Problem & Opportunity

Every group chat and every meeting has an *unspoken* hierarchy — the person who always gets the
last word, the one who hijacks the agenda, the one who replies with a single "ok" and somehow
ends the debate. People already joke about this constantly. There is no tool that takes that
universal in-group joke and turns it into a shareable, instant, AI-generated bit.

**Opportunity:** a low-friction novelty tool that converts a screenshot into a comedy artifact.
The "insight" is intentionally a joke — we are not claiming to measure dominance scientifically.
The value is the *comedic framing of real, visible behavior* (who talks most, who interrupts,
who decides), packaged as an over-confident "official assessment."

**Why now:** modern multimodal LLMs (OpenAI Responses API with image input) can read a
screenshot, identify participants by visible name/handle, infer conversational behavior, and
produce structured, witty text in a single call — making this buildable as a tiny MVP.

---

## 3. Goals & Non-Goals

### Goals
- **G1 — Fast:** From upload to verdict in seconds, single screen, no signup.
- **G2 — Funny:** Output is genuinely sarcastic and clever ("roast ligero"), not generic.
- **G3 — Grounded-in-evidence (comedically):** The roast references *actual visible behavior*
  in the screenshot so it feels personalized, not random.
- **G4 — Safe by default:** Judges behavior only; never appearance or protected traits.
- **G5 — Private by default:** No screenshots or results are persisted or logged.

### Non-Goals
- **NG1 — Real assessment:** Not a personality test, not psychometrics, not HR tooling.
- **NG2 — Data storage / accounts:** No user accounts, history, or saved images in the MVP.
- **NG3 — Virality engineering:** Growth loops, social cards, multi-platform share formats are
  **explicitly deferred** (see §17). MVP ships only a basic "copy verdict" button.
- **NG4 — Native mobile app:** Web only for MVP (responsive, but no iOS/Android app).
- **NG5 — Multi-image / video:** One image per evaluation in MVP.

---

## 4. Target Users & Personas

| Persona | Who they are | What they want |
|---------|--------------|----------------|
| **The Office Banter Crew** | Coworkers who screenshot Teams meetings to roast each other in a side chat. | A quick, savage-but-friendly verdict to drop in the group. |
| **The WhatsApp Friend Group** | A long-running friend group chat full of inside jokes. | To "settle" who the alpha of the chat is, as a bit. |
| **The Curious Lurker** | Someone who saw a friend post a MOG Meter result and wants to try it once. | Frictionless one-shot experience, no signup. |

All personas share: low intent, high desire for instant payoff, zero patience for friction.

---

## 5. User Stories (MoSCoW)

**Must have**
- US-1: As a user, I can upload a screenshot (drag-and-drop or file picker) so I can be evaluated.
- US-2: As a user, I see a preview of my uploaded image so I know it loaded correctly.
- US-3: As a user, I can submit and get a clear loading state so I know it's working.
- US-4: As a user, I receive a verdict with a named winner and a podium ranking.
- US-5: As a user, I see funny "evidence" tied to visible behavior so the roast feels personal.
- US-6: As a user, if the image has no readable signal, I get a low-confidence joke verdict
  instead of a fake-confident one.

**Should have**
- US-7: As a user, I can add optional context (participant names, vibe) to improve the verdict.
- US-8: As a user, I can choose a roast intensity (default "ligero").
- US-9: As a user, I can copy the verdict text to share it manually.
- US-10: As a user, I can retry / evaluate another screenshot without reloading.

**Could have**
- US-11: As a user, I see a mock "official award title" for the winner for extra comedy.
- US-12: As a user, I see the single funniest moment/quote the model spotted.

---

## 6. Functional Requirements

| ID | Requirement |
|----|-------------|
| **FR-1** | The app SHALL provide an image upload via both drag-and-drop and a file picker. |
| **FR-2** | The app SHALL accept `image/png`, `image/jpeg`, and `image/webp` only. |
| **FR-3** | The app SHALL reject files over a max size (default **8 MB**) with a clear message. |
| **FR-4** | The app SHALL show a preview thumbnail of the selected image before submission. |
| **FR-5** | The app SHALL provide an optional free-text **context** field (e.g. names, vibe), max ~500 chars. |
| **FR-6** | The app SHALL provide a **roast intensity** selector with options `ligero` (default), `medio`, `picante`. |
| **FR-7** | On submit, the app SHALL display a loading state and disable re-submission until done. |
| **FR-8** | The backend SHALL send the image + context + intensity to the LLM and return a normalized JSON verdict. |
| **FR-9** | The result SHALL include: `winner`, `ranking[]`, per-person `evidence[]`, `roast`, `confidence`, `award_title`, `funniest_moment`, `share_text`. |
| **FR-10** | When evidence is weak/unreadable, the result SHALL return **low confidence** and a self-aware joke verdict (FR-9 fields still populated). |
| **FR-11** | The app SHALL render the verdict as a styled "official report" card (winner highlighted, podium, evidence bullets, confidence meter, award title). |
| **FR-12** | The app SHALL provide a **copy verdict** button that copies `share_text` to the clipboard. |
| **FR-13** | The app SHALL provide a **"evaluate another"** action that resets state without a full reload. |
| **FR-14** | The app SHALL surface clear, friendly error states for: invalid type, oversized file, missing file, network failure, and LLM/schema failure. |
| **FR-15** | The app SHALL NOT persist, upload-to-storage, or log the raw screenshot at any point. |

---

## 7. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| **NFR-1 (Performance)** | Target end-to-end verdict time **< 12 s** p95 (dominated by the LLM call); UI feedback within 100 ms of submit. |
| **NFR-2 (Privacy)** | Image processed **in memory only**; never written to disk, object storage, or logs. No PII retention. |
| **NFR-3 (Cost control)** | Enforce a per-request token/cost ceiling; downscale images server-side before the LLM call to cap cost. |
| **NFR-4 (Rate limiting)** | Basic per-IP rate limit (e.g. **10 req / 5 min**) to prevent abuse and cost blowups. |
| **NFR-5 (Accessibility)** | Keyboard-operable upload/submit, alt text, sufficient color contrast, focus states. |
| **NFR-6 (Browsers)** | Latest 2 versions of Chrome, Edge, Safari, Firefox; responsive down to 360 px width. |
| **NFR-7 (Resilience)** | LLM/schema failures degrade gracefully to a friendly error, never a stack trace or blank screen. |
| **NFR-8 (Observability)** | Log only non-sensitive metadata (latency, error code, intensity) — never image bytes or verdict content tied to a user. |

---

## 8. UX Flow

```
[Landing / single screen]
        │
        ▼
(1) Upload screenshot ──► (2) Preview shown
        │                        │
        │                        ▼
        │              (3) Optional: add context + pick roast intensity
        │                        │
        ▼                        ▼
(4) Click "Evaluar" ──► (5) Loading state ("Analizando jerarquías de poder...")
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
        (6a) Verdict card                (6b) Error / low-signal card
                 │                               │
                 ▼                               ▼
        (7) Copy verdict / Evaluate another  (retry)
```

Loading-state copy should itself be funny (rotating messages like *"Midiendo egos..."*,
*"Contando interrupciones..."*) to keep the wait entertaining.

---

## 9. System Architecture

**Stack:** Next.js + TypeScript (App Router), single page + one API route. No database.

```
Browser (Next.js page, client component)
  │  multipart/form-data: image + context + intensity
  ▼
/api/evaluate-alpha  (Next.js Route Handler, server-side)
  │  - validate type/size
  │  - downscale image (cost control), convert to data URL (in memory)
  │  - build prompt (system + user + image)
  ▼
OpenAI Responses API  (multimodal input + Structured Outputs JSON schema)
  │  structured JSON verdict
  ▼
/api/evaluate-alpha  (validate against schema, normalize, strip anything unsafe)
  │  JSON response
  ▼
Browser renders Verdict Card
```

**Key components (frontend):**
- `UploadDropzone` — drag/drop + file picker, validation, preview.
- `ContextControls` — optional context field + intensity selector.
- `VerdictCard` — winner, podium, evidence, confidence meter, award title, copy button.
- `ErrorState` / `LowSignalState` — friendly fallbacks.

**Key modules (backend):**
- Request validation (type/size/missing).
- Image preprocessing (downscale, to data URL, in memory).
- LLM client wrapper (prompt assembly + Responses API call + Structured Outputs).
- Response normalization + safety filter.

---

## 10. API Contract

### Request — `POST /api/evaluate-alpha`
`multipart/form-data`:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `image` | file | yes | png/jpeg/webp, ≤ 8 MB |
| `context` | string | no | ≤ 500 chars; names, vibe |
| `intensity` | enum | no | `ligero` (default) \| `medio` \| `picante` |

### Success Response — `200`
```json
{
  "winner": "string (participant name/handle as seen in screenshot)",
  "ranking": [
    { "rank": 1, "name": "string", "alpha_score": 0-100, "one_liner": "string" }
  ],
  "evidence": [
    { "name": "string", "observations": ["string"] }
  ],
  "roast": "string (the main comedic verdict paragraph, ES/Spanglish)",
  "confidence": 0-100,
  "award_title": "string (mock corporate award, e.g. 'Director Regional de Interrumpir')",
  "funniest_moment": "string | null",
  "share_text": "string (compact, copy-pasteable verdict)",
  "limits": "string (what the model could NOT determine)",
  "safety_flags": ["string"]
}
```

### Error Response — `4xx / 5xx`
```json
{
  "error": {
    "code": "INVALID_TYPE | FILE_TOO_LARGE | MISSING_IMAGE | RATE_LIMITED | LLM_ERROR | SCHEMA_ERROR | INTERNAL",
    "message": "human-friendly string (shown to user)"
  }
}
```

**Notes:**
- The response is validated against a strict JSON Schema via OpenAI **Structured Outputs**;
  a schema mismatch returns `SCHEMA_ERROR` rather than rendering garbage.
- `low confidence` is NOT an error — it returns `200` with `confidence` low and `limits`
  explaining why (covers FR-10 / US-6).

---

## 11. LLM Prompt Design

**Model:** A current OpenAI vision-capable model via the **Responses API**, with image input and
**Structured Outputs** bound to the §10 schema. (Exact model pinned at build time — see §18.)

**System prompt intent (not final copy):**
- Persona: a wildly over-confident "corporate alpha-male analyst" who writes witty, sarcastic
  verdicts in **Spanish / Spanglish**.
- Tone scales with `intensity`: `ligero` = playful; `medio` = sharper; `picante` = savage —
  but **never cruel, never about appearance or protected traits**.
- **Evidence rule:** base every claim on *visible interaction behavior only* — speaking turns,
  message volume, interruptions, who makes decisions, who controls the agenda, reaction/emoji
  dominance, last-word patterns, tone of messages. Quote/paraphrase visible text when possible.
- **Hard guardrails:** do NOT infer dominance from faces, bodies, gender, race, age,
  attractiveness, disability, or any personal/protected attribute. If asked to, refuse in-character
  and pivot to behavior.
- **Low-signal fallback:** if the screenshot has no readable names or behavior, return a
  self-aware low-confidence joke verdict and populate `limits` honestly.
- Output MUST conform to the structured schema; no extra prose outside it.

**User prompt:** the image + optional context + selected intensity.

---

## 12. Safety, Ethics & Privacy

- **What it judges:** visible conversational behavior only (volume, interruptions, decisions,
  agenda control, reactions, tone of written messages).
- **What it never judges:** appearance, gender, race, ethnicity, age, attractiveness, disability,
  health, religion, or any protected/personal characteristic.
- **Refusal behavior:** if a user's context tries to push the model toward appearance- or
  identity-based judgments, the model declines in-character and stays on behavior.
- **Privacy:** image is processed in memory and discarded after the response; no storage, no raw
  image logging, no third-party sharing beyond the LLM API call required to function.
- **Framing:** every result and the landing page carry the **"entertainment, not a real
  assessment"** disclaimer.
- **Content boundaries:** verdicts avoid slurs, harassment of real identifiable third parties
  beyond the lighthearted in-group roast, and anything sexual or demeaning.

---

## 13. Success Metrics (MVP, lightweight)

Since growth/virality is out of scope, MVP success is mostly **qualitative**:

| Metric | Target / signal |
|--------|-----------------|
| **Verdict coherence** | ≥ 90% of test screenshots yield a verdict that references *actual* visible behavior (manual review). |
| **Funniness (subjective)** | Internal thumbs-up rate ≥ 70% on a curated test set. |
| **Completion rate** | ≥ 80% of started uploads reach a rendered verdict. |
| **Error rate** | < 5% of valid submissions end in a non-user error (LLM/schema/internal). |
| **Latency** | p95 end-to-end < 12 s (NFR-1). |
| **Safety** | 0 outputs that judge appearance/protected traits in the test set. |

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Model misreads the screenshot / hallucinates participants. | Low-confidence fallback (FR-10); `limits` field forces honesty; instruct model to only name visible participants. |
| Output is offensive or crosses from "roast" to abuse. | Explicit guardrails in prompt (§11–12); `safety_flags`; intensity caps; manual test set for safety. |
| Cost spikes from large images / abuse. | Server-side downscale (NFR-3), per-IP rate limit (NFR-4), per-request cost ceiling. |
| Non-Latin or low-contrast text not OCR'd well. | Treat as low-signal → low-confidence verdict; ask user for a clearer screenshot. |
| Privacy concern / user uploads sensitive chats. | In-memory only, no storage/logging (NFR-2); visible privacy note on the page. |
| LLM API downtime / schema drift. | Graceful error state (NFR-7); strict Structured Outputs validation → `SCHEMA_ERROR`. |

---

## 15. Test Plan

| Scenario | Expected result |
|----------|-----------------|
| **Happy path — Teams** | Screenshot with visible names → ranked JSON + rendered verdict card. |
| **Happy path — WhatsApp** | Group chat screenshot → ranking based on message volume/tone. |
| **Low-signal** | Blurry / no-text image → `200`, low `confidence`, honest `limits`, joke verdict. |
| **Safety — faces only** | Image with only faces, no behavior → no appearance-based judgment; behavior-only or low-confidence verdict. |
| **Privacy** | Verify (logs + disk) that no image bytes are written or persisted anywhere. |
| **API — invalid type** | Upload `.gif`/`.pdf` → `INVALID_TYPE` error, friendly message. |
| **API — oversized** | Upload > 8 MB → `FILE_TOO_LARGE`. |
| **API — missing image** | Submit with no file → `MISSING_IMAGE`. |
| **API — schema failure** | Force malformed LLM output → `SCHEMA_ERROR`, no broken UI. |
| **Rate limit** | Exceed per-IP limit → `RATE_LIMITED`. |
| **Intensity scaling** | Same image at `ligero` vs `picante` → noticeably different tone, still safe. |

---

## 16. Vision & Roadmap

> Phases beyond 0 are **directional**, not specified. Only Phase 0 is committed in this PRD.

**Phase 0 — MVP (this document)**
- Single-screen web app, one screenshot → structured sarcastic verdict, in-memory, copy button.

**Phase 1 — Richer experience**
- More verdict formats and richer result visuals.
- Multi-screenshot evaluation (analyze a longer conversation across images).
- Additional roast modes / personas (e.g. "modo RRHH", "modo telenovela").

**Phase 2 — Depth & reach**
- Optional, opt-in accounts + history (privacy-preserving).
- Full localization (verdicts in multiple languages).
- Additional verdict categories beyond "alpha" (e.g. "el que más trabaja", "el fantasma").

**Phase 3+ — Deferred (NOT specified here)**
- Sharing/virality mechanics and social cards.
- Native mobile app.
- Monetization.

These are listed so engineering builds the MVP without painting itself into a corner, but they
are intentionally left undesigned per the agreed scope.

---

## 17. Open Questions & Assumptions

**Open questions**
- **OQ-1:** Which exact OpenAI vision model to pin at build time (cost vs quality)? Decide during
  implementation against current model availability.
- **OQ-2:** Final max file size (assumed 8 MB) and downscale target resolution.
- **OQ-3:** Hosting target (assumed Vercel given Next.js) and where the API key/secret lives.
- **OQ-4:** Do we ship a one-time disclaimer modal on first visit, or just inline disclaimer text?

**Assumptions**
- MVP is a responsive web app, no native app.
- Verdicts are in Spanish/Spanglish; the PRD itself is English.
- No data persistence of any kind in the MVP.
- OpenAI Responses API (multimodal + Structured Outputs) is the LLM integration.
- "Roast ligero" is the default humor level; `picante` exists but stays non-abusive.

---

*End of PRD — MOG Meter v0.1 (Draft).*
