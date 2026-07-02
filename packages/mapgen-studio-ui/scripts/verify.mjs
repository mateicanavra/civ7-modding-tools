// `verify` — fast artifact-contract assertions over dist/ (CI's fifth target).
//
// Asserts the built package still honors its published contract:
//   1. dist/index.js exists and carries at least EXPECTED_MIN_EXPORTS named
//      exports (the floor RISES as each extraction branch lands components —
//      final: 46 components + TooltipProvider + lib exports).
//   2. No `@civ7/studio-server` specifier anywhere in dist JS (unconditional),
//      and no RUNTIME `@civ7/studio-contract` specifier either — contract
//      usage is type-position only, so it must compile away entirely.
//   3. dist/styles.css ships the dark-default `:root, .dark` token block AND
//      the `.light` block (the single-source theme survived the compile).
//   4. The fonts seam is intact: dist/fonts.css + every font file it
//      references present in dist/fonts/.
//   5. dist/types/index.d.ts exists (the strict tsc tree emit ran).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = (p) => join(pkgRoot, "dist", p);

// B1 scaffold ships an empty barrel; each component branch raises this floor.
const EXPECTED_MIN_EXPORTS = 0;

const failures = [];
const assert = (cond, msg) => {
  if (!cond) failures.push(msg);
};

// 1 + 2 — JS artifact and its import discipline
assert(existsSync(dist("index.js")), "dist/index.js missing — tsup did not run");
if (existsSync(dist("index.js"))) {
  const entry = await import(dist("index.js"));
  const exportCount = Object.keys(entry).length;
  assert(
    exportCount >= EXPECTED_MIN_EXPORTS,
    `dist/index.js has ${exportCount} exports, expected >= ${EXPECTED_MIN_EXPORTS}`
  );
  const jsFiles = readdirSync(join(pkgRoot, "dist")).filter((f) => f.endsWith(".js"));
  for (const f of jsFiles) {
    const code = readFileSync(dist(f), "utf8");
    assert(!code.includes("@civ7/studio-server"), `dist/${f} references @civ7/studio-server`);
    assert(
      // from "..." | dynamic import("...") | require("...") | bare side-effect import "..."
      !/(?:from\s*["']|import\s*\(\s*["']|require\s*\(\s*["']|import\s*["'])@civ7\/studio-contract/.test(
        code
      ),
      `dist/${f} has a RUNTIME @civ7/studio-contract specifier (contract usage must be type-only)`
    );
  }
}

// 3 — theme contract in the compiled stylesheet
if (existsSync(dist("styles.css"))) {
  const css = readFileSync(dist("styles.css"), "utf8");
  assert(
    /:root,\s*\.dark\s*\{/.test(css),
    "dist/styles.css lacks the dark-default `:root, .dark` token block"
  );
  assert(/\.light\s*\{/.test(css), "dist/styles.css lacks the `.light` token block");
} else {
  failures.push("dist/styles.css missing — tailwind CLI did not run");
}

// 4 — fonts seam
if (existsSync(dist("fonts.css"))) {
  const fontsCss = readFileSync(dist("fonts.css"), "utf8");
  const refs = [...fontsCss.matchAll(/url\(\.\/fonts\/([^)]+)\)/g)].map((m) => m[1]);
  assert(refs.length > 0, "dist/fonts.css has no font references");
  for (const file of new Set(refs)) {
    assert(existsSync(dist(join("fonts", file))), `dist/fonts/${file} referenced but missing`);
  }
} else {
  failures.push("dist/fonts.css missing — copy-fonts did not run");
}

// 5 — declaration tree, including the `./types` export condition's exact target
assert(
  existsSync(dist("types/index.d.ts")),
  "dist/types/index.d.ts missing — strict dts emit did not run"
);
assert(
  existsSync(dist("types/types/index.d.ts")),
  "dist/types/types/index.d.ts missing — the `./types` export condition dangles"
);

if (failures.length > 0) {
  console.error("verify: FAILED");
  for (const f of failures) console.error(`  ✖ ${f}`);
  process.exit(1);
}
console.log("verify: artifact contract OK");
