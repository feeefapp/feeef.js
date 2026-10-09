#!/usr/bin/env node
/**
 * Public docs lint (security review #4 F6.6).
 *
 * Public docs describe what the order form does, never how the anti-bot
 * checks decide: no synthetic id markers, no outcome names, no thresholds, no
 * internal rule names. Fails (exit 1) with file:line and the rule that hit.
 *
 *   node scripts/check-public-docs.mjs            # this repo's public docs
 *   node scripts/check-public-docs.mjs a.md dir/  # explicit files / dirs
 *   node scripts/check-public-docs.mjs --self-test
 *
 * No dependencies. Same script in storefront, templates, feeef.dev, feeef.js.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Repo-specific: what counts as public docs here. */
const TARGETS = ["."];
const EXTENSIONS = [".md", ".mdx", ".mdc", ".txt"];
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "out", "coverage"]);

export const RULES = [
  // Built from parts so this file does not itself contain the marker.
  { id: "synthetic-id-marker", re: new RegExp(["fu", "he3", "nf"].join(""), "i") },
  { id: "outcome-name", re: /\btreatments?\b/i },
  { id: "rule-name", re: /\bminTimeInPage\b|\bdoubleSend\b|\boptions\.(frontend|ads|doubleSend|minTimeInPage)\b/ },
  { id: "decoy-wording", re: /\bfake[\s-]+(success|order[\s-]?ids?|ids?)\b|\bsynthetic\s+(order\s+)?ids?\b/i },
  {
    id: "threshold",
    re: /formLoadTime\s*<\s*\d|<\s*3000\b|\bmin(imum)?\.?\s+\d+(\.\d+)?\s*(s|sec|secs|seconds?)\b|\b\d+(\.\d+)?\s*(s|sec|seconds?)\s+(dwell|of\s+(mount|page\s+load)|on\s+(the\s+)?(page|form))\b|\bwithin\s+\d+(\.\d+)?\s*(s|sec|seconds?)\s+of\s+(mount|load)|\b(one|two|three|four|five|ten)[\s-]seconds?\s+(wait|dwell|rule|minimum|check)/i,
  },
];

function* walk(path) {
  let st;
  try {
    st = statSync(path);
  } catch {
    return;
  }
  if (st.isDirectory()) {
    for (const name of readdirSync(path).sort()) {
      if (SKIP_DIRS.has(name)) continue;
      yield* walk(join(path, name));
    }
  } else if (EXTENSIONS.some((e) => path.endsWith(e))) {
    yield path;
  }
}

export function checkText(text) {
  const hits = [];
  text.split("\n").forEach((line, i) => {
    for (const r of RULES) if (r.re.test(line)) hits.push({ line: i + 1, rule: r.id, text: line.trim().slice(0, 140) });
  });
  return hits;
}

function selfTest() {
  const bad = [
    `ids starting with ${["Fu", "He3", "nf"].join("")} are synthetic`,
    "the block treatment rejects",
    "uses minTimeInPage from config",
    "options.frontend window",
    "returns a fake success",
    "if Date.now() - formLoadTime < 3000",
    "min 3s dwell",
    "a submit within 3 seconds of mount",
    "Never fire for synthetic ids",
    "keeps the honeypot, the three-second wait",
  ];
  const good = [
    "Use submitFeeefOrder (or the native form); fire pixels only when shouldSuppressOrderPixelEvents(order) is false.",
    "A direct browser POST to the feeef API is allowed; the API enforces anti-fraud and dedupe.",
    "Auto-redirect after 5s to /",
  ];
  let ok = true;
  for (const s of bad) if (!checkText(s).length) (ok = false), console.error("not caught:", s);
  for (const s of good) if (checkText(s).length) (ok = false), console.error("false positive:", s, checkText(s));
  console.log(ok ? "self-test ok" : "self-test FAILED");
  return ok;
}

const args = process.argv.slice(2);
if (args.includes("--self-test")) process.exit(selfTest() ? 0 : 1);

const roots = (args.length ? args.map((a) => resolve(a)) : TARGETS.map((t) => join(ROOT, t)));
let files = 0;
const problems = [];
for (const r of roots) {
  for (const f of walk(r)) {
    files++;
    for (const h of checkText(readFileSync(f, "utf8"))) problems.push(`${relative(ROOT, f)}:${h.line}: [${h.rule}] ${h.text}`);
  }
}
if (problems.length) {
  console.error(`public docs lint: ${problems.length} problem(s) in ${files} file(s)`);
  for (const p of problems) console.error("  " + p);
  console.error("Describe behaviour only (see scripts/check-public-docs.mjs).");
  process.exit(1);
}
console.log(`public docs lint: ok (${files} file(s))`);
