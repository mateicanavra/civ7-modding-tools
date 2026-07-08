import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import fixture from "./fixtures/authored-tokens.json" with { type: "json" };

// Repo-owned token-signal guard (openspec: studio-ui-token-noise-disposition).
//
// The claude.ai/design app's check_design_system cannot classify compiled
// Tailwind v4 output (78 @property-registered --tw-* vars + @theme defaults
// read as "unclassified tokens" / "selector-scoped custom properties") — that
// classifier is app-side and its findings over this package are permanent
// framework noise. This test is the signal that check cannot give us: every
// custom property in the built stylesheet must be either an authored token
// pinned in test/fixtures/authored-tokens.json (name + kind + scopes) or
// framework-owned per the predicate below. A stray name fails; a Tailwind
// upgrade that changes the engine surface fails until absorbed as a reviewed
// fixture/predicate diff.

// Resolves from either the package dir (direct vitest run) or the repo root
// (root-config project run); the nx test target's build dependency guarantees
// dist/ exists.
const CSS_PATH = [
  resolve(process.cwd(), "dist/styles.css"),
  resolve(process.cwd(), "packages/mapgen-studio-ui/dist/styles.css"),
].find((candidate) => existsSync(candidate));
if (!CSS_PATH) {
  throw new Error("dist/styles.css not found — run the mapgen-studio-ui build first");
}

// Scope labels in the fixture map to the exact selector contexts the theme
// authors own in src/styles/theme.css (as they appear in the built CSS).
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

const VALUE_SHAPES: Record<string, RegExp> = {
  // HSL channel triplet ("240 14% 6%"), consumed as hsl(var(--x)).
  color: /^\d{1,3}(?:\.\d+)?\s+\d{1,3}(?:\.\d+)?%\s+\d{1,3}(?:\.\d+)?%$/,
  // Resolved-color alias over another authored token.
  alias: /^hsl\(var\(--[\w-]+\)\)$/,
  radius: /^\d*\.?\d+rem$/,
  // Authored font stacks lead with the brand family.
  font: /^"(?:Inter|JetBrains Mono)",/,
};

// Framework-owned custom properties: Tailwind v4 engine plumbing and @theme
// defaults emitted because used utilities reference them. @property-registered
// names are definitionally engine vars; the rest are the known internal
// namespaces. A new Tailwind namespace lands as a stray and fails the
// partition test — extend this predicate (or the fixture) as a reviewed diff.
function isFrameworkOwned(name: string, atPropertyRegistered: ReadonlySet<string>): boolean {
  if (atPropertyRegistered.has(name)) return true;
  if (/^--(?:tw|default|animate|blur)-/.test(name)) return true;
  if (/^--(?:tracking|leading|text|container|font-weight)-/.test(name)) return true;
  if (name === "--spacing") return true;
  if (/^--color-[a-z]+-\d+$/.test(name) || name === "--color-black" || name === "--color-white") {
    return true;
  }
  return false;
}

function normalizeSelector(selector: string): string {
  return selector.replace(/\s+/g, " ").trim();
}

interface Declaration {
  readonly name: string;
  readonly value: string;
  readonly stack: readonly string[];
}

// Brace-tracking scan (same method as the change's token inventory): records
// every `--name: value` declaration with its selector stack, plus every
// @property-registered name. Regex-free CSS parsing is deliberate — the file
// is generated, and the scan only needs custom-property declarations.
function scanStylesheet(css: string): {
  declarations: Declaration[];
  atPropertyRegistered: Set<string>;
} {
  const declarations: Declaration[] = [];
  const atPropertyRegistered = new Set<string>();
  const stack: string[] = [];
  let buf = "";
  for (const char of css) {
    if (char === "{") {
      stack.push(buf.trim());
      buf = "";
    } else if (char === "}") {
      stack.pop();
      buf = "";
    } else if (char === ";") {
      const decl = /^(--[\w-]+)\s*:\s*([\s\S]+)$/.exec(buf.trim());
      if (decl) {
        declarations.push({ name: decl[1], value: decl[2].trim(), stack: [...stack] });
      }
      buf = "";
    } else {
      buf += char;
    }
  }
  for (const frame of declarations.flatMap((d) => d.stack)) {
    const at = /^@property\s+(--[\w-]+)$/.exec(normalizeSelector(frame));
    if (at) atPropertyRegistered.add(at[1]);
  }
  return { declarations, atPropertyRegistered };
}

const css = readFileSync(CSS_PATH, "utf8");
const { declarations, atPropertyRegistered } = scanStylesheet(css);
const authoredTokens = fixture.tokens as Record<
  string,
  { kind: keyof typeof VALUE_SHAPES; scopes: readonly (keyof typeof SCOPE_SELECTORS)[] }
>;

const byName = new Map<string, Declaration[]>();
for (const decl of declarations) {
  const list = byName.get(decl.name) ?? [];
  list.push(decl);
  byName.set(decl.name, list);
}

describe("design token surface (dist/styles.css)", () => {
  it("partitions every custom property as authored (fixture) or framework-owned", () => {
    const strays = [...byName.keys()].filter(
      (name) => !(name in authoredTokens) && !isFrameworkOwned(name, atPropertyRegistered),
    );
    expect(
      strays,
      `Custom properties in dist/styles.css that are neither in test/fixtures/authored-tokens.json nor framework-owned: ${strays.join(", ")}. ` +
        "New authored token → add it to the fixture with a kind. " +
        "New Tailwind engine surface → extend the framework predicate as a reviewed diff.",
    ).toEqual([]);
  });

  it("declares every authored token in each of its owned scopes", () => {
    const missing: string[] = [];
    for (const [name, spec] of Object.entries(authoredTokens)) {
      const occurrences = byName.get(name) ?? [];
      for (const scope of spec.scopes) {
        if (!occurrences.some((d) => SCOPE_SELECTORS[scope](d.stack))) {
          missing.push(`${name} @ ${scope}`);
        }
      }
    }
    // Dual-scope color tokens missing their `.light` declaration re-create the
    // shipped dark-only regression — this assertion pins both palettes.
    expect(missing, `Authored tokens missing from an owned scope: ${missing.join(", ")}`).toEqual(
      [],
    );
  });

  it("keeps every authored token's value in its kind's shape", () => {
    const violations: string[] = [];
    for (const [name, spec] of Object.entries(authoredTokens)) {
      for (const decl of byName.get(name) ?? []) {
        // Only check declarations in owned scopes; framework re-registrations
        // of the same name elsewhere are covered by the partition test.
        const inOwnedScope = spec.scopes.some((scope) => SCOPE_SELECTORS[scope](decl.stack));
        if (inOwnedScope && !VALUE_SHAPES[spec.kind].test(decl.value)) {
          violations.push(`${name} (${spec.kind}) = "${decl.value}"`);
        }
      }
    }
    expect(violations, `Token values outside their kind's shape: ${violations.join("; ")}`).toEqual(
      [],
    );
  });

  it("does not misclassify authored tokens as framework-owned", () => {
    const swallowed = Object.keys(authoredTokens).filter((name) =>
      isFrameworkOwned(name, atPropertyRegistered),
    );
    expect(
      swallowed,
      `Fixture tokens caught by the framework predicate (the exclusion must not swallow genuine tokens): ${swallowed.join(", ")}`,
    ).toEqual([]);
  });
});
