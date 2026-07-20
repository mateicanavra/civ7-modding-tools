import { expect } from "bun:test";
import { build } from "esbuild";

const textEncoderBannerMarker = "@civ7/adapter map-script TextEncoder compatibility";

/**
 * Proves the final map script satisfies the bounded loader and syntax contract
 * of Civ7's embedded V8. This intentionally observes only runtime imports,
 * TypeBox's known Unicode-regex hazard, and the pre-evaluation TextEncoder
 * bootstrap; it is not a general lint pass over generated output.
 */
export async function expectCiv7MapScriptCompatibility(
  source: string,
  label: string
): Promise<void> {
  const parsed = await build({
    stdin: { contents: source, loader: "js", sourcefile: label },
    bundle: false,
    format: "esm",
    platform: "neutral",
    write: false,
    metafile: true,
    logLevel: "silent",
  });
  const imports = Object.values(parsed.metafile.inputs).flatMap((input) => input.imports);

  expect(
    imports.filter((entry) => !entry.path.startsWith("/base-standard/")),
    `${label} contains an import Civ7's map loader cannot resolve`
  ).toEqual([]);
  expect(
    source.match(/\\[pP]\{/g) ?? [],
    `${label} contains a Unicode-property regular expression Civ7 cannot parse`
  ).toEqual([]);
  expect(source.split(textEncoderBannerMarker).length - 1, `${label} banner count`).toBe(1);
  const installationSites = Array.from(source.matchAll(/globalThis\.TextEncoder\s*=(?!=)/g));
  expect(installationSites.length, `${label} TextEncoder installation count`).toBe(1);

  const installationIndex = installationSites[0]?.index ?? -1;
  const useSites = Array.from(source.matchAll(/new\s+(?:globalThis\.)?TextEncoder\s*\(/g));
  for (const use of useSites) {
    expect(
      installationIndex,
      `${label} constructs TextEncoder before installing the compatibility surface`
    ).toBeLessThan(use.index);
  }
}
