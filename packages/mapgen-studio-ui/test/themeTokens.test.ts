// @vitest-environment node
// (pure artifact test — reads dist/ from disk; the project default is jsdom
// for component tests, where import.meta.url is not a file: URL)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import fixture from "./fixtures/token-contract.json";

/**
 * Theme token contract — the assert_theme_block replacement.
 *
 * The fixture was captured ONCE from the FINAL build-inputs.sh run (the
 * `_ds-compiled.css` dark-default + `.light` blocks the retired pipeline
 * shipped to claude.ai/design). This test pins `dist/styles.css` — the
 * package's compiled artifact — to that contract: the dark palette must be
 * the DEFAULT (`:root, .dark`), the hand-tuned light palette must ride
 * `.light`, and every token name AND value must match. A silent theme
 * degradation (the design-sync bug class: an extractor no-op shipping a
 * light-default or dead-toggle stylesheet) fails here instead of shipping.
 */

const css = readFileSync(fileURLToPath(new URL("../dist/styles.css", import.meta.url)), "utf8");

function tokensOf(selectorPattern: RegExp, label: string): Record<string, string> {
  const matches = [...css.matchAll(selectorPattern)];
  expect(matches.length, `expected exactly one ${label} block in dist/styles.css`).toBe(1);
  const start = css.indexOf("{", matches[0].index) + 1;
  const body = css.slice(start, css.indexOf("}", start));
  const tokens: Record<string, string> = {};
  for (const m of body.matchAll(/(--[\w-]+|color-scheme)\s*:\s*([^;]+);/g)) {
    tokens[m[1]] = m[2].trim();
  }
  return tokens;
}

const stripComment = (o: Record<string, string>) => {
  const { $comment: _ignored, ...rest } = o as Record<string, string> & { $comment?: string };
  return rest;
};

describe("theme token contract (vs the final build-inputs.sh capture)", () => {
  it("ships the dark palette as the default (`:root, .dark`), token-for-token", () => {
    const dark = tokensOf(/:root,\s*\.dark\s*\{/g, "`:root, .dark`");
    expect(dark).toEqual(fixture.dark);
  });

  it("ships the hand-tuned light palette under `.light`, token-for-token", () => {
    const light = tokensOf(/^\.light\s*\{/gm, "`.light`");
    // The retired pipeline's `.light` block carried three theme-invariant
    // vars (--radius + two legacy scrollbar vars) because it re-targeted the
    // app's whole light `:root`. The package hoists those into an
    // always-applied `:root` block instead; assert them there.
    const invariantKeys = ["--radius", "--color-border-secondary", "--color-text-muted"];
    const expectedLight = { ...fixture.light } as Record<string, string>;
    const invariants: Record<string, string> = {};
    for (const k of invariantKeys) {
      invariants[k] = expectedLight[k];
      delete expectedLight[k];
    }
    expect(light).toEqual(expectedLight);

    const invariantBlock = tokensOf(/^:root\s*\{/gm, "theme-invariant `:root`");
    expect(invariantBlock).toMatchObject(invariants);
  });

  it("fixture itself still names the full token surface (sanity)", () => {
    expect(Object.keys(stripComment(fixture.dark)).length).toBeGreaterThanOrEqual(28);
    expect(Object.keys(stripComment(fixture.light)).length).toBeGreaterThanOrEqual(31);
  });
});
