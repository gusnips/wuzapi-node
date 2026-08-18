/**
 * Runnable check for BaseClient response handling.
 *
 * Covers the body-level status guard: WuzAPI can answer HTTP 200 while the
 * envelope reports a failure, so the guard must key off `success`/`code`, not
 * the transport status. Run with: bun check_response_handling.ts
 */
import assert from "assert";
import { createServer } from "http";
import type { AddressInfo } from "net";
import { BaseClient, WuzapiError } from "./src/client.js";

let next: { status: number; body: unknown } = { status: 200, body: {} };
let requestCount = 0;

const server = createServer((_req, res) => {
  requestCount++;
  res.writeHead(next.status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(next.body));
});

class ProbeClient extends BaseClient {
  probe<T>(): Promise<T> {
    return this.get<T>("/probe");
  }
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

await check("rejects before sending when no token is available", async () => {
  const anonymous = new ProbeClient({ apiUrl });
  const before = requestCount;
  await expectWuzapiError(
    () => anonymous.probe(),
    401,
    "No authentication token provided. Either set a token in the client config or provide one in the request options."
  );
  assert.strictEqual(requestCount, before, "no request should have been sent");
});

server.close();
if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log("\nall checks passed");
