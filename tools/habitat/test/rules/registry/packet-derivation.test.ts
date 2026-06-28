import {
  isGenericPacketRolePath,
  isPacketRulePath,
  isStalePrefixedPacketRolePath,
  packetLocationFromArtifactPath,
  packetRolePath,
} from "@habitat/cli/service/model/rules/index";
import { describe, expect, test } from "vitest";

describe("packet derivation", () => {
  const rulePath =
    "/repo/.habitat/docs/blueprints/docs-site/structure/check/require_docs_site_root_inputs/rule.json";

  test("parses semantic placement from the packet path", () => {
    expect(packetLocationFromArtifactPath(rulePath)).toEqual(
      expect.objectContaining({
        niche: "docs",
        blueprint: "docs-site",
        category: "structure",
        artifactKind: "check",
        packetId: "require_docs_site_root_inputs",
        packetDir:
          ".habitat/docs/blueprints/docs-site/structure/check/require_docs_site_root_inputs",
        roleFilename: "rule.json",
      })
    );
  });

  test("derives generic role paths from the packet directory", () => {
    const location = packetLocationFromArtifactPath(rulePath);
    expect(location).not.toBeNull();
    expect(location && packetRolePath(location, "structure.toml")).toBe(
      ".habitat/docs/blueprints/docs-site/structure/check/require_docs_site_root_inputs/structure.toml"
    );
    expect(isPacketRulePath(rulePath)).toBe(true);
    expect(isGenericPacketRolePath(rulePath)).toBe(true);
  });

  test("recognizes stale prefixed packet role files", () => {
    expect(
      isStalePrefixedPacketRolePath(
        ".habitat/docs/blueprints/docs-site/structure/check/require_docs_site_root_inputs/require_docs_site_root_inputs.rule.json"
      )
    ).toBe(true);
    expect(isStalePrefixedPacketRolePath(rulePath)).toBe(false);
  });
});
