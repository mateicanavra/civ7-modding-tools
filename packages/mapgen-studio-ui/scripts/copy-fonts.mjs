// Declarative font asset copy — the last step of `build`.
//
// Ships the @font-face seam: `src/styles/fonts.css` → `dist/fonts.css`, and
// every font file it references → `dist/fonts/`, resolved from the pinned
// @fontsource packages. The url()s in fonts.css are dist-layout-relative
// (`./fonts/<file>`), which is why the file is copied next to `dist/fonts/`
// rather than compiled into `dist/styles.css` (DESIGN.md §2.9).
//
// FAILS LOUDLY on any missing source file: a fontsource bump that renames or
// drops a subset file must break the build here, not ship a stylesheet with
// dead urls.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const fontsCss = join(pkgRoot, "src/styles/fonts.css");
const distDir = join(pkgRoot, "dist");
const distFonts = join(distDir, "fonts");

const css = readFileSync(fontsCss, "utf8");
const refs = [...css.matchAll(/url\(\.\/fonts\/([^)]+)\)/g)].map((m) => m[1]);
if (refs.length === 0) {
  console.error("copy-fonts: FATAL — no url(./fonts/...) references found in src/styles/fonts.css");
  process.exit(1);
}

// Family prefix → owning @fontsource package (files live in <pkg>/files/).
const familyPackages = [
  ["inter-", "@fontsource/inter"],
  ["jetbrains-mono-", "@fontsource/jetbrains-mono"],
];

const require = (await import("node:module")).createRequire(join(pkgRoot, "package.json"));
function sourcePathFor(file) {
  const entry = familyPackages.find(([prefix]) => file.startsWith(prefix));
  if (!entry) {
    console.error(
      `copy-fonts: FATAL — no @fontsource package mapped for referenced file '${file}'`
    );
    process.exit(1);
  }
  const pkgJson = require.resolve(`${entry[1]}/package.json`);
  return join(dirname(pkgJson), "files", file);
}

mkdirSync(distFonts, { recursive: true });
let copied = 0;
for (const file of new Set(refs)) {
  const src = sourcePathFor(file);
  if (!existsSync(src)) {
    console.error(`copy-fonts: FATAL — referenced font file missing from @fontsource: ${src}`);
    process.exit(1);
  }
  copyFileSync(src, join(distFonts, file));
  copied += 1;
}
copyFileSync(fontsCss, join(distDir, "fonts.css"));
console.log(`copy-fonts: dist/fonts.css + ${copied} font files → dist/fonts/`);
