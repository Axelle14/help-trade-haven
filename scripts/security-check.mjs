#!/usr/bin/env node
/**
 * CI Security Check
 * ---------------------------------------------------------------
 * Runs the Supabase database linter against the project and fails
 * the build if any finding is detected that is NOT in the
 * allowlist at scripts/security-baseline.json.
 *
 * Findings that match a `_blockedCategories.names` entry ALWAYS
 * fail the build — even if their rule appears in `allowed`. These
 * cover RLS misconfigurations and PII-exposure rules we never
 * want to silently allow.
 *
 * Required env vars:
 *   SUPABASE_PROJECT_REF   – project ref (e.g. wnefhzacifztyqtcdnzv)
 *   SUPABASE_ACCESS_TOKEN  – personal/service token with
 *                            project read access (Settings → Access
 *                            Tokens in Supabase dashboard).
 *
 * Usage:
 *   node scripts/security-check.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const baselinePath = resolve(__dirname, "security-baseline.json");
const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!PROJECT_REF || !TOKEN) {
  console.error(
    "❌ Missing SUPABASE_PROJECT_REF or SUPABASE_ACCESS_TOKEN. " +
      "Set them in your CI secrets."
  );
  process.exit(2);
}

const allowedNames = new Set(baseline.allowed.map((a) => a.name));
const blockedNames = new Set(baseline._blockedCategories.names);

async function fetchLints() {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/lint`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase API ${res.status}: ${body}`);
  }
  return res.json();
}

const lints = await fetchLints();

const failures = [];
const allowed = [];

for (const lint of lints) {
  const name = lint.name;
  const isBlocked = blockedNames.has(name);
  const isAllowed = allowedNames.has(name);

  if (isBlocked) {
    failures.push({ ...lint, _why: "blocked-category" });
  } else if (!isAllowed) {
    failures.push({ ...lint, _why: "unrecognized" });
  } else {
    allowed.push(lint);
  }
}

console.log(
  `🔍 Supabase linter: ${lints.length} findings ` +
    `(${allowed.length} allowed, ${failures.length} failing)`
);

if (failures.length > 0) {
  console.error("\n❌ Security check FAILED — new findings detected:\n");
  for (const f of failures) {
    const target =
      f.metadata?.name ||
      f.metadata?.table ||
      f.metadata?.schema ||
      "(unknown target)";
    console.error(
      `  • [${f.level}] ${f.name} on ${target}\n    ${f.title || f.description}`
    );
  }
  console.error(
    "\nIf any finding is intentional, add its rule `name` to " +
      "scripts/security-baseline.json (with a written reason). " +
      "Never allow rules listed in _blockedCategories.\n"
  );
  process.exit(1);
}

console.log("✅ No new RLS or PII exposure findings.");
