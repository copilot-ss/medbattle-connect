Deployment checklist for Admin API

- Purpose: Proxy for admin actions (uses SUPABASE_SERVICE_ROLE_KEY server-side). Do NOT put the service role key into any app bundle.

Required secrets (set in your hosting platform / CI):
- SUPABASE_URL -> https://<project>.supabase.co
- SUPABASE_SERVICE_ROLE_KEY -> service role key (rotate if leaked)
- ADMIN_API_TOKEN -> long random secret used to authenticate ops that can issue short tokens
- TOKEN_SIGNING_KEY -> long random secret used to sign short-lived JWTs
- TOKEN_DEFAULT_EXP -> default short token lifetime in seconds (e.g. 300)

Best practices:
- Store secrets in the platform's secret store (Vercel/Render/GCP/Heroku/EAS secrets), never commit to git.
- Lock down inbound access to the Admin API where possible (IP allowlist for known Codex worker IPs, or require additional authentication layer).
- Use the `POST /v1/tokens` endpoint with `ADMIN_API_TOKEN` to mint short-lived tokens with scoped rights for Codex.
- Example: request `{ "scope": "questions:write,questions:read", "expiresIn": 300 }` to grant limited rights for 5 minutes.
- Monitor and rotate `SUPABASE_SERVICE_ROLE_KEY` if accidentally exposed.

Quick start:
1. Copy `.env.example` to `.env` and fill values (for local dev only).
2. Deploy to a server and set secrets via the host's secret manager.
3. Use `ADMIN_API_TOKEN` to request short-lived tokens for Codex, then use those tokens to call scoped endpoints.

Security note: The Admin API exposes powerful operations. Keep `ADMIN_API_TOKEN` and `SUPABASE_SERVICE_ROLE_KEY` strictly server-side.
