// design-sync repo fork — source-storybook adapter (THIN delegating wrapper).
//
// Why this exists:
//   mapgen-studio is a Vite APP, not a published component library — its
//   package.json declares no `main`/`module`/`exports`/`types`. So the
//   converter's `exportedNames(PKG_DIR, pkgJson)` returns an EMPTY public-export
//   set. The storybook adapter then filters every story-derived component to
//   that empty set (package-build.mjs: "storybook: must be public exports"), so
//   all 46 components are dropped as [TITLE_UNMAPPED] and nothing syncs.
//
//   The real export authority for this app is the curated `--entry`
//   (`.design-sync/ds-entry.tsx`), which re-exports exactly the design-system
//   surface — the same 46 components the stories cover. The package-shape
//   adapter already models this with `synthEntry: true` (see source-kit.mjs):
//   when there is no published export surface, the curated entry's components
//   ARE the surface, and package-build.mjs adds them to `exported`. The
//   storybook adapter just never set that flag.
//
// What this does:
//   Delegate to the LIVE bundled adapter, then assert `synthEntry` only when the
//   package publishes nothing (`exportedSet` empty) and the adapter didn't
//   already set it. Delegating instead of copying keeps any future converter
//   improvements to storybook discovery/pairing flowing into this repo — this
//   fork adds one field and nothing else.
//
// Removal condition: drop this fork (and its cfg.libOverrides entry) if the
// bundled storybook adapter starts treating a curated `--entry` with an empty
// published-export set as the export authority on its own.
import {
  bundlePreviewDecorators as realBundlePreviewDecorators,
  resolveStorybook as realResolveStorybook,
} from "../../.ds-sync/lib/source-storybook.mjs";

export async function resolveStorybook(ctx) {
  const src = await realResolveStorybook(ctx);
  if (src && src.shape === "storybook" && !src.synthEntry && (ctx.exportedSet?.size ?? 0) === 0) {
    src.synthEntry = true;
  }
  return src;
}

export const bundlePreviewDecorators = realBundlePreviewDecorators;
