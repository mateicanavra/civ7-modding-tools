// @vitest-environment node
// (pure artifact test — reads dist/ from disk; the project default is jsdom
// for component tests, where import.meta.url is not a file: URL)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import authoredFixture from "./fixtures/authored-tokens.json" with { type: "json" };
import frameworkFixture from "./fixtures/framework-tokens.json" with { type: "json" };
import themeContract from "./fixtures/token-contract.json" with { type: "json" };

// Repo-owned token-signal guard (openspec: studio-ui-token-noise-disposition).
//
// The claude.ai/design app's check_design_system cannot classify compiled
// Tailwind v4 output — its recurring "unclassified tokens" / "selector-scoped
// custom properties" findings over this package are permanent framework noise
// (see .design-sync/NOTES.md and docs/design-tokens.md). This test is the
// signal that check cannot give us. Every custom property in the built
// stylesheet must fall into exactly one of three buckets:
//
//   1. authored — pinned in fixtures/authored-tokens.json as name → kind;
//      scopes derive from kind (KIND_SCOPES), so a dark-only color token is
//      unrepresentable in the fixture, and the scope check is bidirectional.
//   2. @property-registered — Tailwind's engine vars, detected structurally
//      from the stylesheet's own @property rules.
//   3. framework snapshot — the non-@property @theme defaults Tailwind emits
//      for used utilities, pinned exactly in fixtures/framework-tokens.json.
//
// Anything else is a stray and fails. There are deliberately NO name-prefix
// heuristics: an authored token named inside a Tailwind namespace (e.g. a
// future --text-hero) surfaces as a stray instead of being silently absorbed,
// and a Tailwind upgrade that changes the engine surface is a reviewed
// snapshot diff. Siblings: test/themeTokens.test.ts pins the palette VALUES
// against the token-contract fixture (this test pins names/kinds/scopes);
// .ds-sync/lib/emit.mjs carries the skill-owned "--tw-* is engine plumbing"
// classification for the upload docs — not reusable here (the skill refreshes
// that surface), but the same partition idea.

const css = readFileSync(fileURLToPath(new URL("../dist/styles.css", import.meta.url)), "utf8");
const guidelinesDoc = readFileSync(
  fileURLToPath(new URL("../docs/design-tokens.md", import.meta.url)),
  "utf8"
);

// Scope labels map to the exact selector contexts authored in
// src/styles/theme.css, as they appear in the built CSS.
const SCOPE_SELECTORS: Record<string, (stack: readonly string[]) => boolean> = {
  dark: (stack) => stack.some((s) => normalizeSelector(s) === ":root, .dark"),
  light: (stack) => stack.some((s) => normalizeSelector(s) === ".light"),
  invariant: (stack) =>
    stack.some((s) => normalizeSelector(s) === ":root") &&
    !stack.some((s) => s.startsWith("@layer")),
  theme: (stack) =>
    stack.some((s) => s.startsWith("@layer theme")) &&
    stack.some((s) => normalizeSelector(s) === ":root, :host"),
};

// Scopes are a function of kind: every color token must ship BOTH palettes
// (the dark-only regression class), aliases/radius live in the theme-invariant
// :root block, font stacks in Tailwind's @layer theme block.
const KIND_SCOPES: Record<string, readonly (keyof typeof SCOPE_SELECTORS)[]> = {
  color: ["dark", "light"],
  alias: ["invariant"],
  radius: ["invariant"],
  font: ["theme"],
};

const UNSIGNED_DECIMAL = "\\d+(?:\\.\\d+)?";
const OKLCH_VALUE = new RegExp(
  `^oklch\\((${UNSIGNED_DECIMAL}) (${UNSIGNED_DECIMAL}) (${UNSIGNED_DECIMAL})\\)$`
);

function isCanonicalOklch(value: string): boolean {
  const match = OKLCH_VALUE.exec(value);
  if (!match) return false;
  const [lightness, chroma, hue] = match.slice(1).map(Number);
  return (
    [lightness, chroma, hue].every(Number.isFinite) &&
    lightness >= 0 &&
    lightness <= 1 &&
    chroma >= 0 &&
    hue >= 0 &&
    hue < 360
  );
}

const VALUE_GUARDS: Record<string, (value: string) => boolean> = {
  // Full canonical oklch() value, consumed as var(--x): finite unsigned decimal
  // L∈[0,1], C∈[0,∞), H∈[0,360). Each component requires an integer part;
  // percentages, units, none, and alternate color functions are rejected.
  color: isCanonicalOklch,
  // Bare var() reference aliasing another authored token.
  alias: (value) => /^var\(--[\w-]+\)$/.test(value),
  radius: (value) => /^\d*\.?\d+rem$/.test(value),
  // Authored font stacks lead with the brand family.
  font: (value) => /^"(?:Inter|JetBrains Mono)",/.test(value),
};

function normalizeSelector(selector: string): string {
  return selector
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim();
}

interface Declaration {
  readonly name: string;
  readonly value: string;
  readonly stack: readonly string[];
}

// Brace-tracking scan of the generated stylesheet: records every
// `--name: value` declaration with its selector stack, and every
// @property-registered name (harvested from the rule prelude when the frame
// is pushed — @property bodies hold only syntax/inherits/initial-value, so
// declaration stacks alone would never see them). Comments are stripped
// first; quoted strings are skipped so braces/semicolons inside values can't
// corrupt the stack; a block-final declaration without a trailing `;` (the
// minified form) is flushed at `}`.
function scanStylesheet(source: string): {
  declarations: Declaration[];
  atPropertyRegistered: Set<string>;
} {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const declarations: Declaration[] = [];
  const atPropertyRegistered = new Set<string>();
  const stack: string[] = [];
  let buf = "";
  const flushDeclaration = () => {
    const decl = /^(--[\w-]+)\s*:\s*([\s\S]*)$/.exec(buf.trim());
    if (decl) {
      declarations.push({ name: decl[1], value: decl[2].trim(), stack: [...stack] });
    }
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
      const frame = buf.trim();
      stack.push(frame);
      const atProperty = /^@property\s+(--[\w-]+)$/.exec(normalizeSelector(frame));
      if (atProperty) atPropertyRegistered.add(atProperty[1]);
      buf = "";
    } else if (char === "}") {
      flushDeclaration();
      stack.pop();
    } else if (char === ";") {
      flushDeclaration();
    } else {
      buf += char;
    }
  }
  return { declarations, atPropertyRegistered };
}

const { declarations, atPropertyRegistered } = scanStylesheet(css);
const authoredTokens = authoredFixture.tokens as Record<string, keyof typeof KIND_SCOPES>;
const frameworkTokens = new Set<string>(frameworkFixture.tokens);

const byName = new Map<string, Declaration[]>();
for (const decl of declarations) {
  const list = byName.get(decl.name) ?? [];
  list.push(decl);
  byName.set(decl.name, list);
}

function fixtureKindError(name: string, kind: string): string | null {
  if (KIND_SCOPES[kind] && VALUE_GUARDS[kind]) return null;
  return `${name} has unknown kind "${kind}" — add it to KIND_SCOPES and VALUE_GUARDS first`;
}

function valueGuardViolations(
  declarationsByName: ReadonlyMap<string, readonly Declaration[]>
): string[] {
  const violations: string[] = [];
  for (const [name, kind] of Object.entries(authoredTokens)) {
    const kindError = fixtureKindError(name, kind);
    if (kindError) {
      violations.push(kindError);
      continue;
    }
    for (const decl of declarationsByName.get(name) ?? []) {
      if (!VALUE_GUARDS[kind](decl.value)) {
        violations.push(`${name} (${kind}) = "${decl.value}"`);
      }
    }
  }
  return violations;
}

function declarationsByName(source: string): Map<string, Declaration[]> {
  const result = new Map<string, Declaration[]>();
  for (const declaration of scanStylesheet(source).declarations) {
    const list = result.get(declaration.name) ?? [];
    list.push(declaration);
    result.set(declaration.name, list);
  }
  return result;
}

function replaceBackgroundValues(value: string): string {
  const matches = css.match(/--background:\s*oklch\([^)]+\)/g) ?? [];
  const mutatedCss = css.replace(
    /(--background:\s*)oklch\([^)]+\)/g,
    (_declaration, prefix) => `${prefix}${value}`
  );
  expect(matches).toHaveLength(2);
  expect(mutatedCss).not.toBe(css);
  return mutatedCss;
}

describe("design token surface (dist/styles.css)", () => {
  it("partitions every custom property as authored, @property-registered, or snapshot framework", () => {
    // The structural leg must actually fire — an empty set here means the
    // @property harvesting regressed (it is the definitional engine-var
    // detector, not decoration).
    expect(atPropertyRegistered.size).toBeGreaterThan(0);

    const strays = [...byName.keys()].filter(
      (name) =>
        !(name in authoredTokens) && !atPropertyRegistered.has(name) && !frameworkTokens.has(name)
    );
    expect(
      strays,
      `Custom properties in dist/styles.css that are neither authored (fixtures/authored-tokens.json), @property-registered, nor in the framework snapshot (fixtures/framework-tokens.json): ${strays.join(", ")}. ` +
        "New authored token → add it to authored-tokens.json with a kind. " +
        "Tailwind surface change → regenerate framework-tokens.json as a reviewed diff."
    ).toEqual([]);

    // Keep the snapshot honest in the other direction too: entries that no
    // longer exist in the build are stale and must be pruned.
    const stale = [...frameworkTokens].filter((name) => !byName.has(name));
    expect(
      stale,
      `framework-tokens.json entries absent from dist/styles.css (stale snapshot): ${stale.join(", ")}`
    ).toEqual([]);
  });

  it("keeps the authored fixture disjoint from the framework buckets", () => {
    const conflicts = Object.keys(authoredTokens).filter(
      (name) => atPropertyRegistered.has(name) || frameworkTokens.has(name)
    );
    expect(
      conflicts,
      `Authored tokens colliding with a framework bucket (rename the token or resolve the snapshot): ${conflicts.join(", ")}`
    ).toEqual([]);
  });

  it("declares every authored token in exactly its kind's scopes (both directions)", () => {
    const problems: string[] = [];
    for (const [name, kind] of Object.entries(authoredTokens)) {
      const kindError = fixtureKindError(name, kind);
      if (kindError) {
        problems.push(kindError);
        continue;
      }
      const expected = KIND_SCOPES[kind];
      const occurrences = byName.get(name) ?? [];
      for (const scope of expected) {
        if (!occurrences.some((d) => SCOPE_SELECTORS[scope](d.stack))) {
          problems.push(`${name} missing from ${scope}`);
        }
      }
      // Reverse containment: every declaration of an authored token must sit
      // in one of its kind's scopes — a declaration leaking into another
      // context (or a fixture kind understating real scopes) fails loudly
      // instead of narrowing the guard.
      for (const decl of occurrences) {
        if (!expected.some((scope) => SCOPE_SELECTORS[scope](decl.stack))) {
          problems.push(`${name} declared outside its ${kind} scopes: "${decl.stack.join(" > ")}"`);
        }
      }
    }
    expect(problems, `Authored token scope violations: ${problems.join("; ")}`).toEqual([]);
  });

  it("keeps every authored token's value inside its kind's canonical form", () => {
    const violations = valueGuardViolations(byName);
    expect(
      violations,
      `Token values outside their kind's contract: ${violations.join("; ")}`
    ).toEqual([]);
  });

  it.each([
    ["lower bounds", "oklch(0 0 0)", true],
    ["upper finite bounds", "oklch(1 0 359.999)", true],
    ["multidigit unbounded chroma", "oklch(0.5 12.25 180)", true],
    ["out-of-range negative chroma", "oklch(0.5 -0.1 180)", false],
    ["out-of-range lightness", "oklch(1.001 0 0)", false],
    ["out-of-range hue", "oklch(0.5 0.1 360)", false],
    ["percentage syntax", "oklch(50% 0.1 180)", false],
    ["malformed component", "oklch(0.5 nope 180)", false],
    ["empty value", "", false],
    ["HSL value", "hsl(240 14% 6%)", false],
  ])("routes %s through the built-artifact value guard", (_case, value, accepted) => {
    const violations = valueGuardViolations(declarationsByName(replaceBackgroundValues(value)));
    if (accepted) {
      expect(violations).toEqual([]);
    } else {
      expect(violations).toContain(`--background (color) = "${value}"`);
    }
  });

  it("agrees with the theme token contract fixture on the authored surface", () => {
    // themeTokens.test.ts pins palette VALUES against token-contract.json;
    // this pin ties the two fixtures' name sets together so a token added to
    // one cannot silently miss the other.
    const contractDark = Object.keys(themeContract.dark).filter((k) => k.startsWith("--"));
    const fixtureColors = Object.entries(authoredTokens)
      .filter(([, kind]) => kind === "color")
      .map(([name]) => name);
    expect(fixtureColors.sort()).toEqual(contractDark.sort());

    const fixtureInvariants = Object.entries(authoredTokens)
      .filter(([, kind]) => kind === "alias" || kind === "radius")
      .map(([name]) => name)
      .sort();
    expect(fixtureInvariants).toEqual(
      ["--color-border-secondary", "--color-text-muted", "--radius"].sort()
    );
  });

  it("keeps the synced guidelines doc's vocabulary in step with the fixture", () => {
    // docs/design-tokens.md ships to the claude.ai/design project on every
    // re-sync (cfg.guidelinesGlob); its table must name every authored token.
    const missing = Object.keys(authoredTokens).filter((name) => !guidelinesDoc.includes(name));
    expect(
      missing,
      `Authored tokens missing from docs/design-tokens.md (the synced vocabulary table): ${missing.join(", ")}`
    ).toEqual([]);
  });
});
