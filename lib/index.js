// Host half of @auranlu/dsh-client-ui-monitor.
// Exposes `GET /api/deepseek-balance`, which proxies DeepSeek's
// `GET /user/balance` using the stored DEEPSEEK_API_KEY credential.
// Deliberately imports nothing: the credential ref is a plain string and the
// `webServer` service arrives through `ctx`, so this package stays fully
// self-contained inside the profile's node_modules.
const name = "dsh-client-ui-monitor";
const inject = ["webServer"];

const BALANCE_PATH = "/api/deepseek-balance";

function respond(res, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(200, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: "exact",
    path: BALANCE_PATH,
    handler: async (_req, res) => {
      try {
        let apiKey;
        const credentials = ctx.get("credentials");
        if (credentials) {
          const hit = await credentials.resolve("DEEPSEEK_API_KEY");
          apiKey = hit && hit.value;
        }
        if (!apiKey) apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) return respond(res, { ok: false, error: "no_api_key" });

        const base = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
        const upstream = await fetch(`${base}/user/balance`, {
          headers: { authorization: `Bearer ${apiKey}` },
        });
        const data = await upstream.json();
        if (!upstream.ok) {
          const message = data && data.error && data.error.message
            ? data.error.message
            : `upstream ${upstream.status}`;
          return respond(res, { ok: false, error: message });
        }
        respond(res, { ok: true, balance: data });
      } catch (error) {
        respond(res, { ok: false, error: (error && error.message) || String(error) });
      }
    },
  }), "ui-monitor: /api/deepseek-balance route");
}

export { apply, inject, name };
