import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  OFFICIAL_RESOURCE_CORPUS,
  OFFICIAL_RESOURCE_CORPUS_ARTIFACT,
  OFFICIAL_RESOURCE_TYPE_ORDER,
  type OfficialResourceType,
} from "../../src/domain/resources/index.js";

const repoRoot = join(import.meta.dir, "../../../..");
const officialRoot = join(repoRoot, ".civ7/outputs/resources");
const baseStandardRoot = join(officialRoot, "Base/modules/base-standard");
const resourceFiles = [
  "Base/modules/base-standard/data/resources.xml",
  "Base/modules/base-standard/data/resources-v2.xml",
] as const;
const ageResourceFiles = {
  AGE_ANTIQUITY: [
    "Base/modules/age-antiquity/data/resources.xml",
    "Base/modules/age-antiquity/data/resources-v2.xml",
  ],
  AGE_EXPLORATION: [
    "Base/modules/age-exploration/data/resources.xml",
    "Base/modules/age-exploration/data/resources-v2.xml",
  ],
  AGE_MODERN: [
    "Base/modules/age-modern/data/resources.xml",
    "Base/modules/age-modern/data/resources-v2.xml",
  ],
} as const;

function readOfficial(relativePath: string): string {
  return readFileSync(join(officialRoot, relativePath), "utf8");
}

function extractSection(xml: string, section: string): string {
  const match = xml.match(new RegExp(`<${section}>[\\s\\S]*?</${section}>`));
  return match?.[0] ?? "";
}

function extractResourcesRows(relativePath: string): string[] {
  const section = extractSection(readOfficial(relativePath), "Resources");
  return Array.from(section.matchAll(/<Row\s+ResourceType="([^"]+)"/g), (match) => match[1]!);
}

function extractResourceTypesRows(relativePath: string): string[] {
  const section = extractSection(readOfficial(relativePath), "Types");
  return Array.from(section.matchAll(/<Row\s+Type="(RESOURCE_[^"]+)"\s+Kind="KIND_RESOURCE"/g), (match) => match[1]!);
}

function parseAttrs(row: string): Record<string, string> {
  return Object.fromEntries(Array.from(row.matchAll(/([A-Za-z_]+)="([^"]*)"/g), (match) => [match[1]!, match[2]!]));
}

function normalizeDistribution(attrs: Record<string, string>) {
  const keys = [
    "AdjacentToLand",
    "LakeEligible",
    "Staple",
    "MinimumPerHemisphere",
    "HemisphereUnique",
    "BonusResourceSlots",
    "UnlocksCiv",
    "Tradeable",
  ];
  const result: Record<string, boolean | number> = {};
  for (const key of keys) {
    if (!(key in attrs)) continue;
    const normalizedKey = `${key[0]!.toLowerCase()}${key.slice(1)}`;
    const value = attrs[key]!;
    result[normalizedKey] = /^\d+$/.test(value) ? Number(value) : value === "true";
  }
  return result;
}

function collectOfficialFacts() {
  const rows = new Map<OfficialResourceType, Record<string, string>>();
  const ages = new Map<OfficialResourceType, string[]>();
  const biomeCounts = new Map<OfficialResourceType, number>();
  const yields = new Map<OfficialResourceType, Array<Record<string, string>>>();
  const tags = new Map<OfficialResourceType, string[]>();

  for (const file of resourceFiles) {
    const xml = readOfficial(file);
    for (const match of extractSection(xml, "Resources").matchAll(/<Row\s+([^>]*ResourceType="RESOURCE_[^"]+"[^>]*)\/>/g)) {
      const attrs = parseAttrs(match[0]!);
      attrs.sourceFile = file;
      rows.set(attrs.ResourceType as OfficialResourceType, attrs);
    }
    for (const match of extractSection(xml, "Resource_ValidAges").matchAll(/<Row\s+([^>]*)\/>/g)) {
      const attrs = parseAttrs(match[0]!);
      const resourceType = attrs.ResourceType as OfficialResourceType;
      ages.set(resourceType, [...(ages.get(resourceType) ?? []), attrs.AgeType!]);
    }
    for (const match of extractSection(xml, "Resource_ValidBiomes").matchAll(/<Row\s+([^>]*)\/>/g)) {
      const attrs = parseAttrs(match[0]!);
      const resourceType = attrs.ResourceType as OfficialResourceType;
      biomeCounts.set(resourceType, (biomeCounts.get(resourceType) ?? 0) + 1);
    }
    for (const match of extractSection(xml, "Resource_YieldChanges").matchAll(/<Row\s+([^>]*)\/>/g)) {
      const attrs = parseAttrs(match[0]!);
      const resourceType = attrs.ResourceType as OfficialResourceType;
      yields.set(resourceType, [
        ...(yields.get(resourceType) ?? []),
        { YieldType: attrs.YieldType!, YieldChange: attrs.YieldChange! },
      ]);
    }
    for (const match of extractSection(xml, "TypeTags").matchAll(/<Row\s+([^>]*)\/>/g)) {
      const attrs = parseAttrs(match[0]!);
      if (!attrs.Type?.startsWith("RESOURCE_")) continue;
      const resourceType = attrs.Type as OfficialResourceType;
      tags.set(resourceType, [...(tags.get(resourceType) ?? []), attrs.Tag!]);
    }
  }

  const classOverrides = new Map<OfficialResourceType, Array<Record<string, string>>>();
  for (const [age, files] of Object.entries(ageResourceFiles)) {
    for (const file of files) {
      const resourcesSection = extractSection(readOfficial(file), "Resources");
      for (const match of resourcesSection.matchAll(
        /<Update>\s*<Where\s+ResourceType="(RESOURCE_[^"]+)"\/>\s*<Set\s+ResourceClassType="(RESOURCECLASS_[^"]+)"\/>\s*<\/Update>/g
      )) {
        const resourceType = match[1] as OfficialResourceType;
        classOverrides.set(resourceType, [
          ...(classOverrides.get(resourceType) ?? []),
          { age, resourceClass: match[2]!, sourceFile: file },
        ]);
      }
    }
  }

  return { rows, ages, biomeCounts, yields, tags, classOverrides };
}

describe("official resource corpus contract", () => {
  it("records the base-standard Resources row-order corpus separately from runtime ids", () => {
    const officialResourcesRowOrder = resourceFiles.flatMap(extractResourcesRows);

    expect(OFFICIAL_RESOURCE_CORPUS).toHaveLength(55);
    expect(OFFICIAL_RESOURCE_TYPE_ORDER).toEqual(officialResourcesRowOrder);
    expect(new Set(OFFICIAL_RESOURCE_TYPE_ORDER).size).toBe(55);

    for (const [index, entry] of OFFICIAL_RESOURCE_CORPUS.entries()) {
      expect(entry.staticResourceRowSlot).toBe(index);
      expect(entry.staticSource.table).toBe("Resources");
      expect(entry.runtimeId.status).toBe("unverified");
      expect(entry.runtimeId.value).toBeNull();
      expect(entry.resourceType).toBe(officialResourcesRowOrder[index]);
    }
  });

  it("guards against treating Types declaration order as the corpus order", () => {
    const typesOrder = resourceFiles.flatMap(extractResourceTypesRows);

    expect(new Set(typesOrder)).toEqual(new Set(OFFICIAL_RESOURCE_TYPE_ORDER));
    expect(typesOrder).not.toEqual(OFFICIAL_RESOURCE_TYPE_ORDER);
    expect(typesOrder[0]).toBe("RESOURCE_CAMELS");
    expect(OFFICIAL_RESOURCE_TYPE_ORDER[0]).toBe("RESOURCE_COTTON");
  });

  it("keeps caveats explicit for runtime id proof and no-biome-row resources", () => {
    const artifact = OFFICIAL_RESOURCE_CORPUS_ARTIFACT;
    const rubies = OFFICIAL_RESOURCE_CORPUS.find((entry) => entry.resourceType === "RESOURCE_RUBIES");
    const lotus = OFFICIAL_RESOURCE_CORPUS.find((entry) => entry.resourceType === "RESOURCE_LOTUS");
    const blocked = OFFICIAL_RESOURCE_CORPUS.filter(
      (entry) => entry.strategyRequired.status === "blocked"
    );

    expect(artifact.source.order).toBe("base-standard.modinfo Resources row order");
    expect(artifact.source.runtimeIdStatus).toBe("unverified");
    expect(rubies?.staticResourceRowSlot).toBe(44);
    expect(rubies?.runtimeId.status).toBe("unverified");
    expect(rubies?.validAges).toEqual(["AGE_ANTIQUITY", "AGE_EXPLORATION"]);
    expect(rubies?.officialPlacementConstraints.validBiomeConstraintCount).toBe(4);
    expect(lotus).toBeUndefined();
    expect(blocked.map((entry) => entry.resourceType).sort()).toEqual([
      "RESOURCE_CLOVES",
      "RESOURCE_GOLD_DISTANT_LANDS",
      "RESOURCE_LAPIS_LAZULI",
      "RESOURCE_NICKEL",
      "RESOURCE_SILVER_DISTANT_LANDS",
    ]);
  });

  it("matches source-backed official row fields for every corpus entry", () => {
    const facts = collectOfficialFacts();

    for (const entry of OFFICIAL_RESOURCE_CORPUS) {
      const row = facts.rows.get(entry.resourceType);
      expect(row).toBeDefined();
      expect(entry.name).toBe(row?.Name);
      expect(entry.tooltip).toBe(row?.Tooltip);
      expect(entry.staticSource).toEqual({ file: row?.sourceFile, table: "Resources" });
      expect(entry.baseClass).toBe(row?.ResourceClassType);
      expect(entry.weight).toBe(Number(row?.Weight));
      expect(entry.validAges).toEqual(facts.ages.get(entry.resourceType) ?? []);
      expect(entry.ageClassOverrides).toEqual(facts.classOverrides.get(entry.resourceType) ?? []);
      expect(entry.officialPlacementConstraints.validBiomeConstraintCount).toBe(
        facts.biomeCounts.get(entry.resourceType) ?? 0
      );
      expect(entry.officialPlacementConstraints.hasOfficialBiomeConstraints).toBe(
        (facts.biomeCounts.get(entry.resourceType) ?? 0) > 0
      );
      expect(entry.officialPlacementConstraints.sourceTables).toEqual(
        (facts.biomeCounts.get(entry.resourceType) ?? 0) > 0
          ? [{ file: row?.sourceFile, table: "Resource_ValidBiomes" }]
          : []
      );
      expect(entry.yieldChanges).toEqual(facts.yields.get(entry.resourceType) ?? []);
      expect(entry.typeTags).toEqual(facts.tags.get(entry.resourceType) ?? []);
      expect(entry.officialPlacementConstraints.placementFlags).toEqual(
        normalizeDistribution(row ?? {})
      );
    }
  });

  it("matches base-standard modinfo resource file load order", () => {
    const modinfo = readFileSync(join(baseStandardRoot, "base-standard.modinfo"), "utf8");
    const loadedResourceFiles = Array.from(
      modinfo.matchAll(/<Item>(data\/resources(?:-v2)?\.xml)<\/Item>/g),
      (match) => `Base/modules/base-standard/${match[1]!}`
    );

    expect(loadedResourceFiles).toEqual([...resourceFiles]);
    expect(OFFICIAL_RESOURCE_CORPUS_ARTIFACT.source.sourceFiles).toEqual([...resourceFiles]);
  });
});
