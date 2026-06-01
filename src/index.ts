interface Env {
  VECTOR_INDEX: Vectorize;
  CACHE: KVNamespace;
  AI: Ai;
  ADMIN_EMAIL: string;
  MCP_BEARER_TOKEN?: string;
  OPTIONAL_WEBHOOK_URL?: string;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    // Auto-generate bearer token on first request if missing
    let token = await env.CACHE.get("bearer_token");
    if (!token) {
      token =
        env.MCP_BEARER_TOKEN ||
        crypto.randomUUID().replace(/-/g, "");
      await env.CACHE.put("bearer_token", token);
    }

    const url = new URL(req.url);

    if (url.pathname === "/search") {
      const q = url.searchParams.get("q") ?? "hello world";
      const embedding = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
        text: [q],
      });
      const vector = (embedding as { data: number[][] }).data[0];
      const result = await env.VECTOR_INDEX.query(vector, { topK: 5 });
      return Response.json(result);
    }

    return Response.json({
      ok: true,
      admin: env.ADMIN_EMAIL,
      token_present: !!token,
      webhook_configured: !!env.OPTIONAL_WEBHOOK_URL,
    });
  },
};
