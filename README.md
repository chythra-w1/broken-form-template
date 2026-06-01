# dtc-broken-form-bugs

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/REPLACE_ME/dtc-broken-form-bugs)

> Replace `REPLACE_ME` with your GitHub username after you push this repo, then commit the README so the button works in the live repo.

## What this template tests

**Category A: Form bugs.** Cloudflare's deploy form asks for things wrong, or doesn't ask for things it should. The user can't get past the form (or gets past it confused).

This template intentionally reproduces three known bugs.

## Where each failure occurs in the deploy flow

The Deploy to Cloudflare flow has roughly six steps:

1. **Click button** → land on `deploy.workers.cloudflare.com`.
2. **Auth** → sign in to Cloudflare and connect a Git provider.
3. **Configure form** → name Worker/repo, fill in resource and secret fields.
4. **Submit form** → Cloudflare validates the form.
5. **Clone + provision** → Cloudflare copies repo into your GitHub, creates resources.
6. **Build + deploy** → Workers Builds runs `npm install` + your `deploy` script.

| # | Bug | Fails at step |
|---|---|---|
| 1 | Vectorize `Dimensions` and `Metric` fields are blank with no template-provided default | **Step 3 → 4** — user is stuck on the form, must guess values or read the README |
| 2 | `.dev.vars.example` lines `MCP_BEARER_TOKEN` and `OPTIONAL_WEBHOOK_URL` are forced required even though the `cloudflare.bindings.<NAME>.description` in `package.json` says "leave blank" | **Step 3 → 4** — form-submit validation blocks deploy if either is empty |
| 3 | `kv_namespaces[0]` has no default `id` in `wrangler.jsonc` | **Step 4 or 5** — form may accept it, but provisioning or first deploy can fail because no default ID exists |

## Expected user experience

1. User clicks the button.
2. Signs in.
3. On the config form they see:
   - Two empty fields labeled `Dimensions` and `Metric` for `VECTOR_INDEX` with no hint they should be `768` and `cosine`.
   - Three secret fields: `ADMIN_EMAIL`, `MCP_BEARER_TOKEN`, `OPTIONAL_WEBHOOK_URL`. Descriptions say "leave blank" for two of them.
4. User leaves `MCP_BEARER_TOKEN` blank as instructed → **Deploy button stays disabled / form rejects submit**.
5. User has to invent a value to get past the form, defeating the auto-generate-on-first-request design.

## What the template is supposed to do (if the form worked)

A tiny Worker with two routes:
- `GET /` → returns JSON with admin email, whether a bearer token exists, and whether a webhook is configured.
- `GET /search?q=...` → uses Workers AI `@cf/baai/bge-base-en-v1.5` (768-dim, cosine) to embed the query and look it up in Vectorize.

## Source citations

- Vectorize blank fields and forced-required secrets: [workers-sdk#14075](https://github.com/cloudflare/workers-sdk/issues/14075)
- Missing default values for bindings: [Deploy to Cloudflare docs → automatic resource provisioning](https://developers.cloudflare.com/workers/platform/deploy-buttons/#automatic-resource-provisioning)

## To reproduce

1. Push this folder to a new public GitHub repo.
2. Update the `REPLACE_ME` in the badge URL above.
3. Click the badge.
4. Walk through the form and observe the three failures.
