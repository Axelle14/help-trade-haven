# CI Security Check

This directory contains a CI guard that re-runs the Supabase database
linter on every PR, push to `main`, and once a day on a schedule.

## What it does

`security-check.mjs` calls the Supabase Management API
(`/v1/projects/:ref/database/lint`) — the same source that powers the
Security tab inside Lovable — and compares each finding against
`security-baseline.json`.

The build **fails** if:

1. A finding's rule `name` matches anything in
   `_blockedCategories.names` (RLS misconfig, PII exposure,
   `auth.users` exposure, security-definer views, etc.). These are
   **never** allowed, even if the rule also appears in `allowed`.
2. A finding's rule `name` is **not** in the `allowed` list.

The build **passes** when every finding is either gone or appears in
the `allowed` allowlist.

## Allowing an expected finding

Only do this after a human review. Edit
`scripts/security-baseline.json` and add an entry under `allowed` with
the linter rule `name` and a short written reason. Example:

```json
{
  "name": "0028_anon_security_definer_function_executable",
  "reason": "RPCs like place_point_order intentionally use SECURITY DEFINER. Reviewed YYYY-MM-DD."
}
```

Anything in `_blockedCategories.names` will still fail even if listed
in `allowed` — that list exists specifically so a future maintainer
cannot accidentally silence an RLS or PII finding.

## Required secrets

Set these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret name              | Where to get it |
| ------------------------ | --------------- |
| `SUPABASE_PROJECT_REF`   | Cloud → Overview → Project settings |
| `SUPABASE_ACCESS_TOKEN`  | Supabase dashboard → Account → Access Tokens |

## Running locally

```bash
SUPABASE_PROJECT_REF=... SUPABASE_ACCESS_TOKEN=... npm run security:check
```
