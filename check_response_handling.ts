/**
 * Runnable check for BaseClient response handling and auth-header resolution.
 *
 * Covers the body-level status guard (WuzAPI can answer HTTP 200 while the
 * envelope reports a failure, so the guard must key off `success`/`code`, not
 * the transport status) and the header split (`token` on user routes,
 * `Authorization` on /admin/*, never both).
 * Run with: bun check_response_handling.ts
 */
import assert from "assert";
import { createServer } from "http";
import type { AddressInfo } from "net";
import { BaseClient, WuzapiError } from "./src/client.js";
import type { RequestOptions } from "./src/types/common.js";

let next: { status: number; body: unknown } = { status: 200, body: {} };
let requestCount = 0;
let lastHeaders: Record<string, string | string[] | undefined> = {};

const server = createServer((req, res) => {
  requestCount++;
  lastHeaders = req.headers;
  res.writeHead(next.status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(next.body));
});

const ok = { status: 200, body: { code: 200, data: null, success: true } };

class ProbeClient extends BaseClient {
  probe<T>(options?: RequestOptions): Promise<T> {
    return this.get<T>("/probe", options);
  }
}

class AdminProbeClient extends ProbeClient {
  protected readonly authScheme = "admin" as const;
}

const failures: string[] = [];

function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(
      () => console.log(`  ok  ${name}`),
      (err: Error) => {
        failures.push(name);
        console.log(`FAIL  ${name}\n      ${err.message}`);
      }
    );
}

async function expectWuzapiError(
  run: () => Promise<unknown>,
  code: number,
  message: string
): Promise<void> {
  try {
    await run();
  } catch (err) {
    assert.ok(err instanceof WuzapiError, `expected WuzapiError, got ${err}`);
    assert.strictEqual(err.code, code);
    assert.strictEqual(err.message, message);
    return;
  }
  throw new Error("expected a throw, but the call resolved");
}

await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
const apiUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
const client = new ProbeClient({ apiUrl, token: "t" });

await check("unwraps the envelope on success", async () => {
  next = { status: 200, body: { code: 200, data: { ok: true }, success: true } };
  assert.deepStrictEqual(await client.probe(), { ok: true });
});

await check("throws on success:false with the server's error text", async () => {
  next = { status: 200, body: { code: 500, error: "boom", success: false } };
  await expectWuzapiError(() => client.probe(), 500, "boom");
});

await check("falls back to a string data payload for the message", async () => {
  const detail = "HMAC key must be at least 32 characters long";
  next = { status: 200, body: { code: 400, data: detail, success: false } };
  await expectWuzapiError(() => client.probe(), 400, detail);
});

// The regression the previous `code <= 200 && code >= 300` guard could never catch.
await check("throws on a non-2xx body code even when success is true", async () => {
  next = { status: 200, body: { code: 500, data: null, success: true } };
  await expectWuzapiError(() => client.probe(), 500, "API request failed");
});

await check("maps a real HTTP error through the interceptor", async () => {
  next = { status: 400, body: { code: 400, error: "bad request", success: false } };
  await expectWuzapiError(() => client.probe(), 400, "bad request");
});

await check("rejects before sending when no user token is available", async () => {
  const anonymous = new ProbeClient({ apiUrl });
  const before = requestCount;
  await expectWuzapiError(
    () => anonymous.probe(),
    401,
    "No user token provided. Set `token` in the client config, or pass `{ token }` in the request options."
  );
  assert.strictEqual(requestCount, before, "no request should have been sent");
});

// WuzAPI's user middleware reads only `token`; its admin middleware reads only
// `Authorization`. Sending the wrong header — or both — is a 401 on the server.
await check("sends the config user token as the `token` header only", async () => {
  next = ok;
  await client.probe();
  assert.strictEqual(lastHeaders.token, "t");
  assert.strictEqual(lastHeaders.authorization, undefined);
});

await check("a per-request token still travels in the user header", async () => {
  next = ok;
  await client.probe({ token: "other-user" });
  assert.strictEqual(lastHeaders.token, "other-user");
  assert.strictEqual(lastHeaders.authorization, undefined);
});

await check("admin modules send `adminToken` as `Authorization` only", async () => {
  next = ok;
  await new AdminProbeClient({ apiUrl, token: "t", adminToken: "a" }).probe();
  assert.strictEqual(lastHeaders.authorization, "a");
  assert.strictEqual(lastHeaders.token, undefined);
});

await check("an admin module never falls back to the user token", async () => {
  const before = requestCount;
  await expectWuzapiError(
    () => new AdminProbeClient({ apiUrl, token: "t" }).probe(),
    401,
    "No admin token provided. Set `adminToken` in the client config, or pass `{ token }` in the request options."
  );
  assert.strictEqual(requestCount, before, "no request should have been sent");
});

server.close();
if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
