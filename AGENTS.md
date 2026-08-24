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
bun run test          # bun check_response_handling.ts
bun run build         # vite build (cleans dist first via prebuild)
node check_endpoints.js   # diff openapi-spec.yml against implemented routes
bun run release:patch     # bun pm version patch && bun publish
```

**There is no test framework, and none should be added.** `typecheck` + `lint` carry most of the weight. `bun run test` runs `check_response_handling.ts`, a single dependency-free script that exercises `BaseClient` against a throwaway `node:http` server using `node:assert` — follow that shape for any new check. `lint`, `typecheck`, and `test` all run on `prepublishOnly`.

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

1. **Auth header resolution** (`buildHeaders`). WuzAPI's two middlewares (`handlers.go`) each read exactly one header and never fall back to the other: `authadmin` on `/admin/*` reads `Authorization`, `authalice` on everything else reads `token`. `/health` is mounted outside both and takes no credential. So the header is decided by **the module**, not by the token value: `BaseClient.authScheme` is `"user"` by default and `AdminModule` overrides it to `"admin"`; the scheme selects both the header and which config field supplies the default (`config.token` vs `config.adminToken`). `options.token` overrides the *value* only. A missing credential throws `WuzapiError(401)` naming the field, before any network call.
2. **Response unwrapping.** The server wraps everything in `WuzapiResponse<T>` (`{ code, data, success, error }`). `request()` returns `response.data.data` — module methods are typed against the *inner* payload, not the envelope. The one documented exception is `/health`, which returns bare JSON; `SystemModule.getHealth()` deliberately bypasses `request()` and calls axios directly.
3. **Error normalization.** An axios interceptor converts every transport/HTTP failure into `WuzapiError(code, message, details)`. Nothing else in the codebase throws. Both this path and the envelope guard resolve their message through `resolveErrorMessage()`, which prefers the envelope's `error`, then `message`, then a bare string `data` — WuzAPI uses `error`, so reading `message` alone silently loses the server's explanation.

### Type layer

`src/types/` is the bulk of the package (~4000 of ~5000 lines) and is split by domain, all re-exported through `src/types/index.ts` → `src/index.ts`. Three files carry disproportionate weight:

- `message.ts` — WhatsApp protobuf message shapes (transcribed from whatsmeow/waProto).
- `events.ts` — whatsmeow event structs, for typing webhook `event` payloads.
- `webhook.ts` — the webhook subsystem: `WebhookEventType` enum (~48 events), payload unions, type guards (`hasS3Media`, `hasBase64Media`, `isWebhookEventType`, `isValidWebhookPayload`), and `discoverMessageType()`, which branches on which `*Message` key is present in a generic message. These guards are part of the public API and are how consumers narrow untyped webhook bodies — extend them whenever a new message or event type lands.

Prefer discriminated unions and mapped types over loose records; `UserModule.setPrivacy<K extends keyof PrivacySettingValueMap>(name, value)` is the house pattern for "the valid values depend on the key."

### Build

Vite library mode, **CJS output only**, with `axios` external and sourcemaps on. `vite-plugin-dts` emits declarations. Module entry points are derived by reading `src/modules/` at config time, so a new module gets its deep-import path automatically — the list used to be hand-maintained and had silently drifted. The three non-module entries (`index`, `client`, `wuzapi-client`) and `types/index` are still listed explicitly.

Note `package.json` maps both `import` and `require` to the same CJS `dist/index.js`, and `dist/` is gitignored (built at publish time).

## Working in this codebase

### Adding or changing an endpoint

1. Confirm the contract in **`openapi-spec.yml`** — the vendored WuzAPI spec (71 paths) and the source of truth for request/response shapes.
2. Add request/response interfaces to the matching `src/types/<domain>.ts`. Field names follow the server's casing verbatim (`Phone`, `Body`, `Id`, `Subscribe`) — do **not** normalize to camelCase.
3. Add the method to the module: a doc comment, an `options?: RequestOptions` last parameter, and a single `this.get/post/put/delete<T>(...)` call. Modules stay declarative — no logic beyond building the request body.
4. Run `node check_endpoints.js` to confirm coverage. Its regex cannot parse template-literal routes, conditional query strings, or the `/health` bypass, so a few known false positives are expected on both sides: spec-side `GET /health`, `GET /user/lid/{phone}`, `POST /user/privacy`, `POST /session/disconnect`; impl-side `PUT /admin/users/{id}`, `POST /chat/archive`, `POST /session/history`, `POST path`, the `getLid` template literal.
5. Update `README.md` (the API reference there is exhaustive and is the package's real documentation) and add a `CHANGELOG.md` entry under a new version heading.

Adding a whole new module additionally requires exporting it from `src/index.ts` and registering it as a field in `WuzapiClient`. The Vite entry is picked up automatically.

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
- A failure can arrive over **HTTP 200** with `success: false` and a non-2xx envelope `code`. Never treat the transport status as the outcome.
