# ServiceSwap

Skill-swapping marketplace built with **React + TypeScript + Vite**, backed by
**Lovable Cloud** (managed PostgreSQL, auth and storage accessed over HTTPS).

## Local development

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:8080.

Copy `.env.example` to `.env` and fill in the values before running.

## Quality checks

```bash
npm run lint            # ESLint
npx tsc -b --noEmit     # TypeScript type check
npm test                # Vitest
npm run build           # production build → dist/
```

## Container development

```bash
docker compose build
docker compose up -d
```

Then open http://localhost:8080.

Stopping:

```bash
docker compose down
```

Viewing logs:

```bash
docker compose logs
```

## Documentation

- [Containerization guide](docs/containerization.md) — architecture, Docker,
  Nginx, environment variables, troubleshooting, security.
- [Future CI/CD pipeline](pipelines/README.md) — planned Azure DevOps flow.

## Environment variables

Only `VITE_*` variables exist and they are **public by design** (inlined into
the browser bundle at build time). Never place passwords, service-role keys or
private keys in them. See `.env.example`.
