# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

`wuzapi` — a TypeScript client library for [WuzAPI](https://github.com/asternic/wuzapi), a Go multi-user/multi-device WhatsApp REST server. This package is a **thin, fully-typed HTTP wrapper**: it owns no business logic, no state, and no retry/queue behavior. Every method maps 1:1 to a WuzAPI endpoint.

Consequence: the value of a change is almost entirely in *type fidelity to the server*, not in cleverness. When the server contract and the local types disagree, the server wins — fix the types.

## Commands

Package manager is **bun** (`packageManager: bun@1.3.8`). Use `bun run`, not `npm run`.

```bash
bun install
bun run lint          # eslint src --ext .ts,.tsx
bun run lint:fix
bun run typecheck     # tsc --noEmit — the primary correctness gate
bun run build         # vite build (cleans dist first via prebuild)
node check_endpoints.js   # diff openapi-spec.yml against implemented routes
bun run release:patch     # bun pm version patch && bun publish
```

**There is no test suite.** `bun run test` is a stub that exits 0. `typecheck` + `lint` are the real gates and both run automatically on `prepublishOnly`. If you add a runnable check, keep it dependency-free (plain assert script) — there is no test framework installed.

## Architecture

### Client composition

`WuzapiClient` (`src/wuzapi-client.ts`) is a facade that instantiates ten modules, each a subclass of `BaseClient`, each given the same `WuzapiConfig`. Modules are independent — **each one creates its own axios instance**, so there is no shared connection pool or interceptor state. Adding cross-cutting behavior (retries, rate limiting) belongs in `BaseClient`, never in a module.

```
WuzapiClient
├── admin       → /admin/*      (user provisioning; admin token)
├── session     → /session/*    (connect, QR, pairphone, S3, proxy, HMAC, history)
├── user        → /user/*       (info, check, avatar, contacts, privacy, block)
├── chat        → /chat/*       (send/*, react, markread, download/*, edit, delete, archive)
├── group       → /group/*      (create, participants, invites, settings)
├── webhook     → /webhook      (set/get/update/delete)
├── newsletter  → /newsletter/*
├── status      → /status/*
├── call        → /call/*
└── system      → /health
```

`users` and `message` are legacy aliases for `user` and `chat` — kept intentionally; do not remove without a major version bump.

### BaseClient — the only place HTTP happens

`src/client.ts` owns three responsibilities:

1. **Auth header resolution** (`buildHeaders`). A per-request `options.token` that differs from `config.token` is sent as the `Token` header; `config.token` is always sent as `Authorization`. This mirrors WuzAPI's split: user endpoints read `token`, admin endpoints read `Authorization`. Missing both throws `WuzapiError(401)` before any network call.
2. **Response unwrapping.** The server wraps everything in `WuzapiResponse<T>` (`{ code, data, success, error }`). `request()` returns `response.data.data` — module methods are typed against the *inner* payload, not the envelope. The one documented exception is `/health`, which returns bare JSON; `SystemModule.getHealth()` deliberately bypasses `request()` and calls axios directly.
3. **Error normalization.** An axios interceptor converts every failure into `WuzapiError(code, message, details)`. Nothing else in the codebase throws.

### Type layer

`src/types/` is the bulk of the package (~4000 of ~5000 lines) and is split by domain, all re-exported through `src/types/index.ts` → `src/index.ts`. Three files carry disproportionate weight:

- `message.ts` — WhatsApp protobuf message shapes (transcribed from whatsmeow/waProto).
- `events.ts` — whatsmeow event structs, for typing webhook `event` payloads.
- `webhook.ts` — the webhook subsystem: `WebhookEventType` enum (~48 events), payload unions, type guards (`hasS3Media`, `hasBase64Media`, `isWebhookEventType`, `isValidWebhookPayload`), and `discoverMessageType()`, which branches on which `*Message` key is present in a generic message. These guards are part of the public API and are how consumers narrow untyped webhook bodies — extend them whenever a new message or event type lands.

Prefer discriminated unions and mapped types over loose records; `UserModule.setPrivacy<K extends keyof PrivacySettingValueMap>(name, value)` is the house pattern for "the valid values depend on the key."

### Build

Vite library mode, **CJS output only**, with `axios` external and sourcemaps on. `vite-plugin-dts` emits declarations. The entry list in `vite.config.ts` is explicit per module — **it is currently missing `modules/status`, `modules/call`, and `modules/system`**, so those ship only bundled inside `index.js`. Add new modules to that list if they need a deep-import path.

Note `package.json` maps both `import` and `require` to the same CJS `dist/index.js`, and `dist/` is gitignored (built at publish time).

## Working in this codebase

### Adding or changing an endpoint

1. Confirm the contract in **`openapi-spec.yml`** — that is the current spec (71 paths). `spec.yml` is an older snapshot (63 paths); treat it as stale and prefer updating/removing it over syncing to it.
2. Add request/response interfaces to the matching `src/types/<domain>.ts`. Field names follow the server's casing verbatim (`Phone`, `Body`, `Id`, `Subscribe`) — do **not** normalize to camelCase.
3. Add the method to the module: a doc comment, an `options?: RequestOptions` last parameter, and a single `this.get/post/put/delete<T>(...)` call. Modules stay declarative — no logic beyond building the request body.
4. Run `node check_endpoints.js` to confirm coverage. Its regex cannot parse template-literal routes or the `/health` bypass, so a few known false positives are expected (`GET /user/lid/{phone}`, `POST /user/privacy`, `GET /health`).
5. Update `README.md` (the API reference there is exhaustive and is the package's real documentation) and add a `CHANGELOG.md` entry under a new version heading.

Adding a whole new module additionally requires: export it from `src/index.ts`, register it as a field in `WuzapiClient`, and add its entry to `vite.config.ts`.

### Conventions

- **Imports use explicit `.js` extensions** even in `.ts` source (`from "../types/common.js"`). Required by the module resolution setup — match it.
- Method signatures favor primitives for simple endpoints (`setStatusText(body)`, `pairPhone(phone)`) and a request object for anything with more than ~2 fields (`sendText(request)`). Build the typed request struct inside the method.
- `tsconfig` is strict with `noUnusedLocals` / `noUnusedParameters`. `@typescript-eslint/no-explicit-any` is a warning, but production code here has none — keep it that way.
- Debug logging goes through `src/utils/logger.ts` (the `debug` package, `wuzapi:*` namespaces), gated on `config.debug`. `DEBUG=wuzapi:* node app.js` at runtime.
- ESLint 9 flat config in `eslint.config.mjs` is what actually runs; `.eslintrc.js` is a leftover legacy config.

### Gotchas

- `WebhookEvent` is `keyof typeof WebhookEventType` — enum *key* names (`"MESSAGE"`), not wire values (`"Message"`). Webhook methods accept `(WebhookEvent | string)[]` so `WebhookEventType.MESSAGE` (which is the string `"Message"`) is what you should actually pass.
- Phone numbers are country-code-prefixed with no `+` (e.g. `5491155554444`).
- `examples/` are plain `.js` files run against a live WuzAPI server; they are not part of the build or typecheck.
