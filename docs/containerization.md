# ServiceSwap — Containerization (Lab 01)

## 1. Current architecture (audited, not guessed)

| Item | Value |
| --- | --- |
| React | ^18.3.1 |
| TypeScript | ^5.8.3 |
| Vite | ^5.4.19 (`@vitejs/plugin-react-swc`) |
| Router | react-router-dom ^6.30.1 (client-side SPA routing) |
| UI | Tailwind CSS 3.4 + shadcn/Radix, framer-motion |
| Data layer | @tanstack/react-query + @supabase/supabase-js ^2.104.1 |
| Mobile shell | Capacitor 8 (Android wrapper, optional) |
| Node used to verify build | v22.22.0 (Node 22 LTS selected for Docker) |
| Package manager | npm (`package-lock.json` present → `npm ci`). A `bun.lock` also exists but npm is authoritative for CI/Docker. |
| Dev command | `npm run dev` (Vite dev server, port 8080) |
| Build command | `npm run build` → outputs `dist/` |
| Lint | `npm run lint` (ESLint 9 flat config) |
| Tests | `npm test` (Vitest 3 + Testing Library, jsdom) — one example test in `src/test/` |
| Type check | no dedicated script; run `npx tsc -b --noEmit` |
| Server-side code in repo | none. Only SQL migrations in `supabase/migrations/` and a Node CI script `scripts/security-check.mjs`. No edge functions, no API server. |
| Existing Docker files | none before this lab |

### Backend / database

- The backend is **Lovable Cloud** (managed Supabase / PostgreSQL).
- The browser talks to it **only over HTTPS through the Supabase REST/Realtime
  API** using the publishable (anon) key — PostgreSQL is never reached
  directly from the client, and no connection string exists in the repo.
- **Authentication is handled by Lovable Cloud / Supabase Auth**
  (`src/contexts/AuthContext.tsx`, `src/integrations/lovable/index.ts` for
  Google/Apple/Microsoft OAuth). There is no custom auth code, no JWT signing
  in the app.
- Authorization is enforced server-side by Row Level Security plus
  `has_role()` checks; the client is untrusted.

**This lab does not change the backend.** The container packages the compiled
frontend only; it keeps calling the same Lovable Cloud endpoint.

## 2. Docker architecture

```text
Stage 1: node:22-alpine (build)
    |
    ├── npm ci                (from package-lock.json)
    ├── npm run build         (Vite → dist/)
    └── dist/
            |
            v
Stage 2: nginx:1.27-alpine (production)
    |
    ├── docker/nginx.conf  →  /etc/nginx/conf.d/default.conf
    ├── dist/              →  /usr/share/nginx/html
    └── EXPOSE 80
```

The final image contains **no `node_modules`, no `src/`, no TypeScript, no dev
dependencies** — only static assets and nginx. If the app fails to compile,
`npm run build` exits non-zero and the image build fails.

The Vite **dev server is never used in production**.

## 3. Nginx

`docker/nginx.conf`:

- `try_files $uri $uri/ /index.html` so client routes such as `/explore`,
  `/dashboard`, `/admin`, `/chat`, `/my-listings` resolve instead of 404.
- `/healthz` returns `200 ok`, unauthenticated, for Docker and Azure probes.
- Long-lived immutable caching for fingerprinted `/assets/`, `no-cache` for
  `index.html` so deploys are picked up immediately.
- Dotfiles denied, `server_tokens off`, `nosniff` / `X-Frame-Options` /
  `Referrer-Policy` headers.

## 4. Environment variables

Only three exist, all consumed by `src/integrations/supabase/client.ts`:

| Variable | Purpose | Secret? |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Backend API endpoint | No — public |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key | No — public, RLS-protected |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier | No — public |

Vite **inlines `VITE_*` values into the JavaScript bundle at build time**, so
they are visible to anyone who opens the browser. Consequences:

- Never place database passwords, `service_role` keys, private API keys,
  service-account credentials or signing keys in a `VITE_*` variable.
- Server-only secrets belong in the backend secret store (and later, Azure
  Key Vault) — never in this repository or in the image.
- Because they are baked in at build time, the values must be supplied as
  Docker **build args** (see `docker-compose.yml`), not as runtime container
  env vars.

`.env.example` documents the placeholders. Real values stay in the local
`.env`.

## 5. Local Docker commands

```bash
docker compose build          # multi-stage build, runs the real npm run build
docker compose up -d          # serve on http://localhost:8080
docker compose logs -f        # nginx access/error logs
docker compose ps             # shows health status
docker compose down           # stop and remove
```

Direct Docker equivalent:

```bash
docker build -t serviceswap-web:local \
  --build-arg VITE_SUPABASE_URL=... \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=... .
docker run --rm -p 8080:80 serviceswap-web:local
```

Quality gates (also the future pipeline steps):

```bash
npm run lint
npx tsc -b --noEmit
npm test
npm run build
```

## 6. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Build fails at `npm ci` | `package-lock.json` out of sync — run `npm install` locally and commit the lockfile. |
| Blank page, console shows requests to `undefined/...` | `VITE_*` build args were not passed; rebuild with them set. |
| Refreshing `/dashboard` gives 404 | nginx config not copied — confirm `docker/nginx.conf` exists and the `COPY` line ran. |
| Container marked `unhealthy` | `/healthz` unreachable; check `docker compose logs serviceswap-web`. |
| Port 8080 already in use | change the host side of the mapping in `docker-compose.yml`. |
| Auth/OAuth redirect fails from the container | add the container origin (e.g. `http://localhost:8080`) to the backend's allowed redirect URLs. |

## 7. Security considerations

- No secrets in the Dockerfile, image layers, or compose file — only public
  `VITE_*` build args.
- Minimal, immutable production image (alpine nginx + static files); no
  package manager, no source, no dev dependencies at runtime.
- Reproducible builds via `npm ci` against the committed lockfile.
- Dependency and image scanning are planned pipeline stages.
- Data access remains protected by RLS server-side; the client bundle holds no
  privileged credentials.
- HTTPS is terminated by the platform (Azure App Service / front door); the
  container serves plain HTTP on port 80 behind it.
- Known repo finding: the local `.env` is tracked in Git. It contains only the
  three public values above (no secret material), but if it is ever repurposed
  for private values it must be untracked first.

## 8. Future Azure architecture

```text
Git → Azure DevOps → Docker build → Azure Container Registry → Azure App Service
```

Later labs cover backend ownership, PostgreSQL migration, private networking,
Key Vault, managed identity, and full CI/CD. Nothing is deployed to Azure in
Lab 01.
