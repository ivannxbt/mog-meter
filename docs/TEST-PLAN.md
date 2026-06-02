# MOG Meter — Plan de pruebas (PRD §15)

Plan manual para Platform/QA y el equipo. El mock en `/api/evaluate-alpha` permite cubrir la mayoría de escenarios sin OpenAI.

## Pre-requisitos

- `npm run dev` en local
- `.env.local` con `UPSTASH_*` si pruebas rate limit real (opcional en dev sin Redis)
- Capturas de ejemplo: Teams, WhatsApp, imagen borrosa, solo caras

## Disparadores del mock

| Disparador | Cómo activar | Resultado esperado |
|------------|--------------|-------------------|
| OK (default) | Subir imagen válida | `200`, `confidence` alta, ranking completo |
| Low signal | `context` contiene `mock:lowsignal` o `?mock=lowsignal` | `200`, `confidence` baja, `limits` honestos |
| LLM error | `context` contiene `mock:error` o `?mock=error` | `500`, `error.code` = `LLM_ERROR` |
| Health | `GET /api/evaluate-alpha` | JSON `{ ok: true, hint: ... }` |

## Matriz PRD §15

| # | Escenario | Pasos | Resultado esperado | Estado |
|---|-----------|-------|-------------------|--------|
| 1 | Happy path — Teams | Screenshot Teams con nombres | Veredicto con ranking y evidencia visible | ☐ |
| 2 | Happy path — WhatsApp | Screenshot chat grupal | Ranking por volumen/tono visible | ☐ |
| 3 | Low-signal | Imagen borrosa o `mock:lowsignal` | `200`, confidence &lt; 40, `limits` explicados | ☐ |
| 4 | Safety — solo caras | Foto sin chat | Sin juicios de apariencia; baja señal o comportamiento N/A | ☐ |
| 5 | Privacidad | Subir imagen, revisar logs/disco | Sin bytes de imagen en logs ni archivos escritos | ☐ |
| 6 | INVALID_TYPE | Subir `.gif` o `.pdf` | `415`, código `INVALID_TYPE` | ☐ |
| 7 | FILE_TOO_LARGE | Archivo &gt; 8 MB | `413`, código `FILE_TOO_LARGE` | ☐ |
| 8 | MISSING_IMAGE | POST sin archivo | `400`, código `MISSING_IMAGE` | ☐ |
| 9 | SCHEMA_ERROR | (Solo con LLM real) respuesta inválida | `502`, `SCHEMA_ERROR` | N/A mock |
| 10 | Rate limit | 11 POST en 5 min (misma IP, Upstash configurado) | `429`, `RATE_LIMITED` | ☐ |
| 11 | Intensidad | Misma imagen `ligero` vs `picante` | Tono distinto (con LLM real); mock ignora tono | N/A mock |

## Flujo UI (ensamblaje)

| Estado | Verificación |
|--------|----------------|
| idle | Dropzone/picker visible, disclaimer arriba |
| loading | Botón deshabilitado, copy de carga |
| result | VerdictCard, copiar `share_text`, “Evaluar otra” vuelve a idle |
| error | Mensaje del API, botón reintentar |

## Observabilidad (NFR-8)

En desarrollo, el mock loguea solo: `durationMs`, `intensity`, bucket `confidence`, `errorCode` opcional. **Nunca** imagen, contexto ni veredicto completo.

## Producción (Vercel)

1. Variables: `OPENAI_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
2. `npm run build` en CI
3. Smoke: una evaluación OK en preview
4. Sin Upstash en prod → `503 INTERNAL` (fail closed)

## Sign-off

| Rol | Nombre | Fecha |
|-----|--------|-------|
| Platform/QA | | |
| Frontend upload | | |
| Frontend verdict | | |
| Backend/LLM | | |
