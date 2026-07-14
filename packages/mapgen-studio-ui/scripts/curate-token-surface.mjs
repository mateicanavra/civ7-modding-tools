#!/usr/bin/env node
// curate-token-surface — shape dist/styles.css into a truthful design-token
// surface for the claude.ai/design classifier (DEF-017, root ledger
// docs/system/DEFERRALS.md). Successor to annotate-token-kinds.mjs.
//
// The app-side token discovery reads every custom-property DECLARATION in the
// scanned stylesheet (verified 2026-07-18: the regenerated x-omelette
// tokenKinds ordering follows first-declaration order — @theme block, then
// utility-scoped --tw-* assignments, then theme.css tokens, then the
// fallback-only names last; @property preludes are never harvested). So the
// way to keep engine plumbing out of the token registry is to not declare it,
// not to label it. Two moves, in order:
//
// 1. STRIP the trailing `@layer properties { @supports … { *, ::before, …
//    { --tw-*: <initial>; } } }` block — Tailwind's emulation of @property
//    initial values for browsers without @property support. Every supported
//    consumer (the studio app, storybook, the claude.ai/design renderer, the
//    headless-Chrome capture harness) registers these vars via the @property
//    rules that remain, so removal is render-neutral there — and it removes
//    ~78 universal-selector engine declarations from the discovery scan
//    (the bulk of the "unclassified tokens" and "selector-scoped custom
//    properties" findings).
//
// 2. ANNOTATE every remaining custom-property declaration with a trailing
//    `/* @kind <kind> */` comment (the classification input the app accepts):
//    - authored tokens: kind from test/fixtures/authored-tokens.json (the
//      token guard's own source of truth; `alias` maps to `color` — both
//      aliases point at color tokens),
//    - Tailwind @theme defaults: the explicit FRAMEWORK_KINDS map below (kept
//      in step with test/fixtures/framework-tokens.json; a name missing from
//      the map annotates as `other` with a warning — the guard test is the
//      enforcement point for snapshot drift),
//    - `--tw-*` engine vars still declared inside utility bodies: `other`
//      (they are utility plumbing, not tokens, but the scan reads them, so
//      an explicit `other` beats an unclassified stray).
//
// The annotation is a trailing comment after the `;`, invisible to every repo
// consumer (designTokens/themeTokens strip or stop at `;`) and to rendering.
// A brace-scanner cross-check fails the build if any declaration escapes
// annotation, and the strip step fails loudly if the fallback block's shape
// changes — a Tailwind output-shape change surfaces here instead of silently
// shipping a wrong token surface.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PKG = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CSS_PATH = join(PKG, "dist", "styles.css");

const authoredFixture = JSON.parse(
  readFileSync(join(PKG, "test", "fixtures", "authored-tokens.json"), "utf8")
);

// Honest kinds for the non-@property framework snapshot
// (test/fixtures/framework-tokens.json). Vocabulary: the classifier's five
// kinds (color/spacing/radius/shadow/font) plus `other` for engine plumbing.
const FRAMEWORK_KINDS = {
  "--animate-spin": "other",
  "--blur-sm": "other",
  "--color-black": "color",
  "--color-blue-500": "color",
  "--color-emerald-500": "color",
  "--color-gray-400": "color",
  "--color-red-500": "color",
  "--color-red-600": "color",
  "--color-rose-400": "color",
  "--container-lg": "spacing",
  "--container-sm": "spacing",
  "--default-font-family": "font",
  "--default-mono-font-family": "font",
  "--default-transition-duration": "other",
  "--default-transition-timing-function": "other",
  "--font-weight-medium": "font",
  "--font-weight-semibold": "font",
  "--leading-relaxed": "font",
  "--spacing": "spacing",
  "--text-sm": "font",
  "--text-sm--line-height": "font",
  "--tracking-normal": "font",
  "--tracking-tight": "font",
  "--tracking-wide": "font",
  "--tracking-wider": "font",
  "--tracking-widest": "font",
};

const warnings = [];
function kindFor(name) {
  const authored = authoredFixture.tokens[name];
  if (authored) return authored === "alias" ? "color" : authored;
  if (name.startsWith("--tw-")) return "other";
  if (name in FRAMEWORK_KINDS) return FRAMEWORK_KINDS[name];
  warnings.push(name);
  return "other";
}

// Locate and remove the trailing @layer properties fallback block. Structure
// pins (each fails the build if violated, so a Tailwind change is loud):
//   - the block is the LAST top-level construct in the file,
//   - it wraps a single @supports rule,
//   - every declaration inside is --tw-*.
// Returns { css, strippedNames }.
function stripPropertyFallback(source) {
  const marker = "@layer properties {";
  const start = source.lastIndexOf(marker);
  if (start === -1) {
    throw new Error(
      "curate-token-surface: no trailing `@layer properties {` block found — Tailwind output shape changed; re-verify the fallback strip before shipping"
    );
  }
  // Walk braces to the block's end.
  let depth = 0;
  let end = -1;
  for (let i = start; i < source.length; i++) {
    const char = source[i];
    if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) {
    throw new Error("curate-token-surface: unbalanced braces in the @layer properties block");
  }
  if (source.slice(end).trim() !== "") {
    throw new Error(
      "curate-token-surface: the @layer properties block is not the final construct — Tailwind output shape changed; re-verify the fallback strip"
    );
  }
  const block = source.slice(start, end);
  if (!/@supports\s*\(/.test(block)) {
    throw new Error(
      "curate-token-surface: the @layer properties block carries no @supports guard — shape changed; re-verify before stripping"
    );
  }
  const decls = [...block.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]);
  const nonEngine = decls.filter((name) => !name.startsWith("--tw-"));
  if (decls.length === 0 || nonEngine.length > 0) {
    throw new Error(
      `curate-token-surface: the @layer properties block holds unexpected declarations (${
        nonEngine.join(", ") || "none at all"
      }) — refusing to strip content that may be real tokens`
    );
  }
  return {
    css: source.slice(0, start).replace(/\n+$/, "\n"),
    strippedNames: new Set(decls),
  };
}

// Count expected declarations the same way test/designTokens.test.ts does:
// strip comments, brace-track, flush on `;`/`}`. This is the cross-check
// oracle for the line-based annotator below.
function countDeclarations(source) {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, "");
  let count = 0;
  let buf = "";
  const flush = () => {
    if (/^--[\w-]+\s*:/.test(buf.trim())) count++;
    buf = "";
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' || char === "'") {
      buf += char;
      for (i++; i < text.length; i++) {
        buf += text[i];
        if (text[i] === "\\") {
          i++;
          if (i < text.length) buf += text[i];
        } else if (text[i] === char) break;
      }
    } else if (char === "{") {
      buf = "";
    } else if (char === "}" || char === ";") {
      flush();
    } else {
      buf += char;
    }
  }
  return count;
}

const rawCss = readFileSync(CSS_PATH, "utf8");
if (rawCss.includes("/* @kind ")) {
  console.error(
    "curate-token-surface: dist/styles.css is already curated — skipping (rebuild regenerates a clean file)"
  );
  process.exit(0);
}

const { css, strippedNames } = stripPropertyFallback(rawCss);

const expected = countDeclarations(css);
const kindCounts = {};
let annotated = 0;

const DECL_LINE = /^(\s*)(--[A-Za-z][\w-]*)(\s*:\s*)(.*?);(\s*(?:\/\*.*?\*\/)?\s*)$/;
const out = css
  .split("\n")
  .map((line) => {
    const m = DECL_LINE.exec(line);
    if (!m) return line;
    const kind = kindFor(m[2]);
    kindCounts[kind] = (kindCounts[kind] ?? 0) + 1;
    annotated++;
    return `${m[1]}${m[2]}${m[3]}${m[4]}; /* @kind ${kind} */${m[5].trimEnd() ? ` ${m[5].trim()}` : ""}`;
  })
  .join("\n");

if (annotated !== expected) {
  console.error(
    `curate-token-surface: line annotator covered ${annotated} declarations but the stylesheet scanner counted ${expected} — the compiled output shape changed (minified? multi-line values?); fix the annotator before shipping a half-annotated stylesheet`
  );
  process.exit(1);
}

writeFileSync(CSS_PATH, out);
if (warnings.length) {
  const unique = [...new Set(warnings)];
  console.error(
    `curate-token-surface: ${unique.length} unmapped framework name(s) annotated as \`other\` (update FRAMEWORK_KINDS alongside the fixture): ${unique.join(", ")}`
  );
}
console.error(
  `curate-token-surface: stripped the @property fallback layer (${strippedNames.size} engine var names), annotated ${annotated} declarations (${Object.entries(
    kindCounts
  )
    .sort()
    .map(([k, n]) => `${k}: ${n}`)
    .join(", ")})`
);
