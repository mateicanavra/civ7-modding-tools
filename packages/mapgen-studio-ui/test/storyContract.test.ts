// Story-contract guards: the stories are the design-sync fidelity oracle, so
// what they exercise and how they are grouped must be MACHINE-CHECKED, not
// comment-enforced. Three invariant families, each of which has already
// drifted once in this repo's history:
//
// 1. Import contract — story value-imports ride the package's public surface
//    (or sanctioned tooling), never a component's relative path and never a
//    third-party module the barrel re-exports (the `toast`-from-"sonner" case:
//    the story stayed green while the public contract it claimed to prove was
//    broken).
// 2. Title taxonomy — story titles are the sync's card-group authority; each
//    title must agree with .design-sync/config.json's docsMap, and docsMap
//    must be a bijection with the story files (the "Composites/" case split).
// 3. Doc truth — behavior claims shipped to design agents (conventions.md)
//    are derived from source, not hand-maintained prose (the "AppFooter
//    self-provides a TooltipProvider" case — flipped eras ago, doc never
//    followed).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const componentsRoot = join(pkgRoot, "src", "components");

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const storyFiles = walk(componentsRoot).filter((f) => f.endsWith(".stories.tsx"));

const config = JSON.parse(readFileSync(join(pkgRoot, ".design-sync", "config.json"), "utf8")) as {
  docsMap: Record<string, string>;
};
const docsMap = config.docsMap;

/** Every `import … from "spec"` (and side-effect `import "spec"`), with type-only flag. */
const parseImports = (source: string): Array<{ spec: string; typeOnly: boolean }> => {
  const out: Array<{ spec: string; typeOnly: boolean }> = [];
  const re = /import\s+(type\s+)?(?:[\w*{}\s,$]*?from\s+)?"([^"]+)"/g;
  for (const m of source.matchAll(re)) out.push({ spec: m[2] as string, typeOnly: !!m[1] });
  return out;
};

describe("story import contract (the public API is the story contract)", () => {
  const EXACT = new Set(["@swooper/mapgen-studio-ui", "react", "lucide-react", "@rjsf/utils"]);
  const PREFIXES = ["storybook", "@storybook/"];

  it("every story value-import comes from the package name or sanctioned tooling", () => {
    const violations: string[] = [];
    for (const file of storyFiles) {
      const source = readFileSync(file, "utf8");
      for (const { spec, typeOnly } of parseImports(source)) {
        if (typeOnly) continue;
        if (EXACT.has(spec)) continue;
        if (PREFIXES.some((p) => spec.startsWith(p))) continue;
        // Relative imports may only reach the shared storybook helpers — a
        // relative COMPONENT import bypasses the barrel and stops the story
        // from proving the export exists.
        if (spec.startsWith(".") && spec.includes("/storybook/")) continue;
        violations.push(`${file.slice(pkgRoot.length + 1)}: "${spec}"`);
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });
});

describe("story title taxonomy (titles are the sync's card-group authority)", () => {
  const titles = new Map<string, { file: string; prefix: string; component: string }>();
  for (const file of storyFiles) {
    const source = readFileSync(file, "utf8");
    const m = source.match(/title:\s*"([^"]+)"/);
    expect(m, `${file}: no title found`).toBeTruthy();
    const title = (m as RegExpMatchArray)[1] as string;
    const parts = title.split("/");
    expect(parts, `${file}: title "${title}" must be exactly group/Component`).toHaveLength(2);
    const [prefix, component] = parts as [string, string];
    titles.set(component, { file, prefix, component });
  }

  it("titles use a lowercase group prefix and a PascalCase component segment", () => {
    for (const { file, prefix, component } of titles.values()) {
      expect(prefix, `${file}: group "${prefix}" must be lowercase`).toMatch(/^[a-z][a-z-]*$/);
      expect(component, `${file}: segment "${component}" must be PascalCase`).toMatch(
        /^[A-Z][A-Za-z0-9]*$/
      );
    }
  });

  it("every story component is in docsMap and its prefix matches the mapped group", () => {
    for (const { file, prefix, component } of titles.values()) {
      const group = docsMap[component];
      expect(
        group,
        `${file}: "${component}" missing from .design-sync/config.json docsMap`
      ).toBeTruthy();
      expect(prefix, `${file}: title group "${prefix}" disagrees with docsMap ${group}`).toBe(
        basename(group as string, ".md")
      );
    }
  });

  it("docsMap is a bijection with the story files", () => {
    const storied = [...titles.keys()].sort();
    const mapped = Object.keys(docsMap).sort();
    expect(storied).toEqual(mapped);
  });

  it("EXCLUSIONS.md census numerals match the actual storied-component count", () => {
    const exclusions = readFileSync(join(pkgRoot, ".storybook", "EXCLUSIONS.md"), "utf8");
    for (const m of exclusions.matchAll(/\b(\d+)-component\b/g)) {
      expect(Number(m[1]), `EXCLUSIONS.md claims a ${m[1]}-component surface`).toBe(titles.size);
    }
  });
});

describe("conventions.md truth (behavior claims shipped to design agents)", () => {
  const conventions = readFileSync(join(pkgRoot, ".design-sync", "conventions.md"), "utf8");

  // Components whose source composes the tooltip primitive need the ambient
  // provider; the conventions doc must name every one of them. Derived from
  // source so a new tooltip consumer (or a provider-policy flip) fails here
  // instead of aging in prose.
  it("names every tooltip-consuming component in the TooltipProvider bullet", () => {
    const consumers = walk(componentsRoot)
      .filter((f) => f.endsWith(".tsx") && !f.endsWith(".stories.tsx"))
      .filter((f) => /from\s+"[^"]*\/ui\/tooltip\.js"/.test(readFileSync(f, "utf8")))
      .map((f) => basename(f, ".tsx"))
      .filter((name) => name in docsMap);
    expect(consumers.length).toBeGreaterThan(0);
    for (const name of consumers) {
      expect(
        conventions,
        `conventions.md must list \`${name}\` as needing TooltipProvider`
      ).toMatch(new RegExp(`\`${name}\``));
    }
  });

  it("never claims a component self-provides a TooltipProvider unless its source does", () => {
    for (const m of conventions.matchAll(/`(\w+)`\s+self-provides/g)) {
      const name = m[1] as string;
      const file = walk(componentsRoot).find((f) => basename(f, ".tsx") === name);
      const mounts = file ? /<TooltipProvider/.test(readFileSync(file, "utf8")) : false;
      expect(mounts, `conventions.md claims \`${name}\` self-provides a TooltipProvider`).toBe(
        true
      );
    }
  });
});
