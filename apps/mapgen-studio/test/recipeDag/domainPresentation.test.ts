import { readFileSync } from "node:fs";
import { Blocks, Droplet, Leaf, SunSnow } from "lucide-react";
import { describe, expect, it } from "vitest";

import {
  getRecipeDagDomainPresentation,
  getRecipeDagPhaseLaneColors,
  normalizeRecipeDagDomainId,
} from "../../src/features/recipeDag/domainPresentation";

describe("recipe DAG domain presentation", () => {
  it("covers canonical phases and Studio aliases with stable domain ids", () => {
    expect(normalizeRecipeDagDomainId("setup")).toBe("setup");
    expect(normalizeRecipeDagDomainId("foundation")).toBe("foundation");
    expect(normalizeRecipeDagDomainId("morphology")).toBe("morphology");
    expect(normalizeRecipeDagDomainId("shape")).toBe("morphology");
    expect(normalizeRecipeDagDomainId("hydrology")).toBe("hydrology");
    expect(normalizeRecipeDagDomainId("ecology")).toBe("ecology");
    expect(normalizeRecipeDagDomainId("gameplay")).toBe("gameplay");
    expect(normalizeRecipeDagDomainId("placement")).toBe("placement");
    expect(normalizeRecipeDagDomainId("finish")).toBe("finish");
    expect(normalizeRecipeDagDomainId("finalize")).toBe("finish");
    expect(normalizeRecipeDagDomainId("climate")).toBe("climate");
    expect(normalizeRecipeDagDomainId("routing")).toBe("routing");
    expect(normalizeRecipeDagDomainId("unknown-domain")).toBe("artifact");
  });

  it("returns non-generic presentations for every canonical DAG phase", () => {
    const phases = ["setup", "foundation", "morphology", "hydrology", "ecology", "gameplay", "placement"] as const;

    for (const phase of phases) {
      const presentation = getRecipeDagDomainPresentation(phase);
      expect(presentation.id).toBe(phase);
      expect(presentation.label).not.toBe("Artifact");
    }
  });

  it("uses one stable visual vocabulary for domain icons across every DAG surface", () => {
    expect(getRecipeDagDomainPresentation("foundation")).toMatchObject({
      id: "foundation",
      Icon: Blocks,
    });
    expect(getRecipeDagDomainPresentation("morphology")).toMatchObject({
      id: "morphology",
      strokeWidth: 1.9,
    });
    expect(getRecipeDagDomainPresentation("morphology").Icon.displayName).toBe("Stone");
    expect(getRecipeDagDomainPresentation("hydrology")).toMatchObject({
      id: "hydrology",
      Icon: Droplet,
      strokeWidth: 1.9,
    });
    expect(getRecipeDagDomainPresentation("ecology")).toMatchObject({
      id: "ecology",
      Icon: Leaf,
      strokeWidth: 1.8,
    });
    expect(getRecipeDagDomainPresentation("climate")).toMatchObject({
      id: "climate",
      Icon: SunSnow,
      strokeWidth: 1.8,
    });
    expect(getRecipeDagDomainPresentation("gameplay")).toMatchObject({
      id: "gameplay",
    });
    expect(getRecipeDagDomainPresentation("gameplay").Icon.displayName).toBe("Bolt");
  });

  it("maps phase lane colors to domain meaning instead of cycling by order", () => {
    expect(getRecipeDagPhaseLaneColors("ecology", false)).toMatchObject({
      fill: "rgba(6,95,70,0.22)",
      accent: "#34d399",
    });
    expect(getRecipeDagPhaseLaneColors("ecology", true)).toMatchObject({
      fill: "rgba(236,253,245,0.70)",
      accent: "#16a34a",
    });
    expect(getRecipeDagPhaseLaneColors("hydrology", false).accent).toBe("#38bdf8");
    expect(getRecipeDagPhaseLaneColors("morphology", false).accent).toBe("#f59e0b");
    expect(getRecipeDagPhaseLaneColors("gameplay", false).accent).toBe("#a78bfa");
  });

  it("does not expose surface-specific artifact icon overrides", () => {
    expect(getRecipeDagDomainPresentation("hydrology")).toBe(getRecipeDagDomainPresentation("artifact:hydrology.hydrography"));
    expect(getRecipeDagDomainPresentation("ecology")).toBe(getRecipeDagDomainPresentation("artifact:ecology.biomes"));
  });

  it("keeps domain lucide imports centralized outside the view", () => {
    const source = readFileSync(new URL("../../src/features/recipeDag/RecipeDagView.tsx", import.meta.url), "utf8");
    const lucideImport = source.match(/import\s*{([\s\S]*?)}\s*from "lucide-react";/)?.[1] ?? "";
    const importedNames = lucideImport
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    expect(importedNames).toEqual(["AlertTriangle", "ChevronDown", "GitBranch", "Loader2"]);
  });
});
