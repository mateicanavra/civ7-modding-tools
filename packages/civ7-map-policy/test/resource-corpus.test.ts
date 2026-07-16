import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  OFFICIAL_RESOURCE_CORPUS,
  OFFICIAL_RESOURCE_CORPUS_ARTIFACT,
  OFFICIAL_RESOURCE_TYPE_ORDER,
  type OfficialAgeType,
  type OfficialResourceClassType,
  type OfficialResourceType,
  type OfficialYieldType,
  type ResourceClassOverride,
  type ResourceYieldChange,
  requireResourceRuntimeId,
  resolveResourceRuntimeIds,
} from "../src/index.js";

const repoRoot = join(import.meta.dir, "../../..");
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

type OfficialValuePrefix = "AGE_" | "RESOURCE_" | "RESOURCECLASS_" | "YIELD_";

function readOfficial(relativePath: string): string {
  return readFileSync(join(officialRoot, relativePath), "utf8");
}

function extractSection(xml: string, section: string): string {
  const match = xml.match(new RegExp(`<${section}>[\\s\\S]*?</${section}>`));
  return match?.[0] ?? "";
}

function requireAttribute(
  attrs: Readonly<Record<string, string>>,
  attribute: string,
  context: string
): string {
  const value = attrs[attribute];
  if (value === undefined) {
    throw new Error(`${context} is missing ${attribute}`);
  }
  return value;
}

function requireOfficialValue<const TPrefix extends OfficialValuePrefix>(
  value: string | undefined,
  prefix: TPrefix,
  context: string
): `${TPrefix}${string}` {
  if (value === undefined || !value.startsWith(prefix) || value.length === prefix.length) {
    throw new Error(`${context} must start with ${prefix}`);
  }
  return value as `${TPrefix}${string}`;
}

function extractResourcesRows(relativePath: string): OfficialResourceType[] {
  const section = extractSection(readOfficial(relativePath), "Resources");
  return Array.from(section.matchAll(/<Row\s+ResourceType="([^"]+)"/g), (match) =>
    requireOfficialValue(match[1], "RESOURCE_", `${relativePath} Resources row`)
  );
}

function extractResourceTypesRows(relativePath: string): OfficialResourceType[] {
  const section = extractSection(readOfficial(relativePath), "Types");
  return Array.from(
    section.matchAll(/<Row\s+Type="(RESOURCE_[^"]+)"\s+Kind="KIND_RESOURCE"/g),
    (match) => requireOfficialValue(match[1], "RESOURCE_", `${relativePath} Types row`)
  );
}

function parseAttrs(row: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of row.matchAll(/([A-Za-z_]+)="([^"]*)"/g)) {
    const name = match[1];
    const value = match[2];
    if (name === undefined || value === undefined) {
      throw new Error(`Malformed XML attribute in ${row}`);
    }
    attrs[name] = value;
  }
  return attrs;
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
    const value = attrs[key];
    if (value === undefined) continue;
    const normalizedKey = `${key.charAt(0).toLowerCase()}${key.slice(1)}`;
    switch (key) {
      case "MinimumPerHemisphere":
      case "BonusResourceSlots":
        if (!/^\d+$/.test(value)) {
          throw new Error(`Invalid official resource distribution ${key}=${JSON.stringify(value)}`);
        }
        result[normalizedKey] = Number(value);
        break;
      default:
        if (value !== "true" && value !== "false") {
          throw new Error(`Invalid official resource distribution ${key}=${JSON.stringify(value)}`);
        }
        result[normalizedKey] = value === "true";
    }
  }
  return result;
}

describe("official resource distribution evidence", () => {
  it("fails closed for malformed boolean and numeric values", () => {
    expect(() => normalizeDistribution({ Staple: "TRUE" })).toThrow('Staple="TRUE"');
    expect(() => normalizeDistribution({ MinimumPerHemisphere: "-1" })).toThrow(
      'MinimumPerHemisphere="-1"'
    );
  });
});

function collectOfficialFacts() {
  const rows = new Map<OfficialResourceType, Record<string, string>>();
  const ages = new Map<OfficialResourceType, OfficialAgeType[]>();
  const biomeCounts = new Map<OfficialResourceType, number>();
  const yields = new Map<OfficialResourceType, ResourceYieldChange[]>();
  const tags = new Map<OfficialResourceType, string[]>();

  for (const file of resourceFiles) {
    const xml = readOfficial(file);
    for (const match of extractSection(xml, "Resources").matchAll(
      /<Row\s+([^>]*ResourceType="RESOURCE_[^"]+"[^>]*)\/>/g
    )) {
      const attrs = parseAttrs(match[0]);
      const resourceType: OfficialResourceType = requireOfficialValue(
        attrs.ResourceType,
        "RESOURCE_",
        `${file} Resources row`
      );
      attrs.sourceFile = file;
      rows.set(resourceType, attrs);
    }
    for (const match of extractSection(xml, "Resource_ValidAges").matchAll(/<Row\s+([^>]*)\/>/g)) {
      const attrs = parseAttrs(match[0]);
      const resourceType: OfficialResourceType = requireOfficialValue(
        attrs.ResourceType,
        "RESOURCE_",
        `${file} Resource_ValidAges row`
      );
      const age: OfficialAgeType = requireOfficialValue(
        attrs.AgeType,
        "AGE_",
        `${file} Resource_ValidAges row`
      );
      ages.set(resourceType, [...(ages.get(resourceType) ?? []), age]);
    }
    for (const match of extractSection(xml, "Resource_ValidBiomes").matchAll(
      /<Row\s+([^>]*)\/>/g
    )) {
      const attrs = parseAttrs(match[0]);
      const resourceType: OfficialResourceType = requireOfficialValue(
        attrs.ResourceType,
        "RESOURCE_",
        `${file} Resource_ValidBiomes row`
      );
      biomeCounts.set(resourceType, (biomeCounts.get(resourceType) ?? 0) + 1);
    }
    for (const match of extractSection(xml, "Resource_YieldChanges").matchAll(
      /<Row\s+([^>]*)\/>/g
    )) {
      const attrs = parseAttrs(match[0]);
      const resourceType: OfficialResourceType = requireOfficialValue(
        attrs.ResourceType,
        "RESOURCE_",
        `${file} Resource_YieldChanges row`
      );
      const yieldType: OfficialYieldType = requireOfficialValue(
        attrs.YieldType,
        "YIELD_",
        `${file} Resource_YieldChanges row`
      );
      yields.set(resourceType, [
        ...(yields.get(resourceType) ?? []),
        {
          YieldType: yieldType,
          YieldChange: requireAttribute(attrs, "YieldChange", `${file} Resource_YieldChanges row`),
        },
      ]);
    }
    for (const match of extractSection(xml, "TypeTags").matchAll(/<Row\s+([^>]*)\/>/g)) {
      const attrs = parseAttrs(match[0]);
      if (!attrs.Type?.startsWith("RESOURCE_")) continue;
      const resourceType: OfficialResourceType = requireOfficialValue(
        attrs.Type,
        "RESOURCE_",
        `${file} TypeTags row`
      );
      tags.set(resourceType, [
        ...(tags.get(resourceType) ?? []),
        requireAttribute(attrs, "Tag", `${file} TypeTags row`),
      ]);
    }
  }

  const classOverrides = new Map<OfficialResourceType, ResourceClassOverride[]>();
  for (const [ageValue, files] of Object.entries(ageResourceFiles)) {
    const age: OfficialAgeType = requireOfficialValue(
      ageValue,
      "AGE_",
      "Age resource file catalog"
    );
    for (const file of files) {
      const resourcesSection = extractSection(readOfficial(file), "Resources");
      for (const match of resourcesSection.matchAll(
        /<Update>\s*<Where\s+ResourceType="(RESOURCE_[^"]+)"\/>\s*<Set\s+ResourceClassType="(RESOURCECLASS_[^"]+)"\/>\s*<\/Update>/g
      )) {
        const resourceType: OfficialResourceType = requireOfficialValue(
          match[1],
          "RESOURCE_",
          `${file} Resources update`
        );
        const resourceClass: OfficialResourceClassType = requireOfficialValue(
          match[2],
          "RESOURCECLASS_",
          `${file} Resources update`
        );
        classOverrides.set(resourceType, [
          ...(classOverrides.get(resourceType) ?? []),
          { age, resourceClass, sourceFile: file },
        ]);
      }
    }
  }

  return { rows, ages, biomeCounts, yields, tags, classOverrides };
}

describe("official resource corpus", () => {
  it("records the base-standard Resources row-order corpus as source evidence", () => {
    const officialResourcesRowOrder = resourceFiles.flatMap(extractResourcesRows);

    expect(OFFICIAL_RESOURCE_CORPUS).toHaveLength(55);
    expect(OFFICIAL_RESOURCE_TYPE_ORDER).toEqual(officialResourcesRowOrder);
    expect(new Set(OFFICIAL_RESOURCE_TYPE_ORDER).size).toBe(55);

    for (const [index, entry] of OFFICIAL_RESOURCE_CORPUS.entries()) {
      expect(entry.staticResourceRowSlot).toBe(index);
      expect(entry.staticSource.table).toBe("Resources");
      expect(entry.resourceType).toBe(officialResourcesRowOrder[index]);
      expect(Object.hasOwn(entry, "runtimeId")).toBe(false);
    }
  });

  it("guards against treating Types declaration order as the corpus order", () => {
    const typesOrder = resourceFiles.flatMap(extractResourceTypesRows);

    expect(new Set(typesOrder)).toEqual(new Set(OFFICIAL_RESOURCE_TYPE_ORDER));
    expect(typesOrder).not.toEqual(OFFICIAL_RESOURCE_TYPE_ORDER);
    expect(typesOrder[0]).toBe("RESOURCE_CAMELS");
    expect(OFFICIAL_RESOURCE_TYPE_ORDER[0]).toBe("RESOURCE_COTTON");
  });

  it("keeps caveats explicit for row-order proof and no-biome-row resources", () => {
    const artifact = OFFICIAL_RESOURCE_CORPUS_ARTIFACT;
    const rubies = OFFICIAL_RESOURCE_CORPUS.find(
      (entry) => entry.resourceType === "RESOURCE_RUBIES"
    );
    const lotus = OFFICIAL_RESOURCE_CORPUS.find((entry) => entry.resourceType === "RESOURCE_LOTUS");
    const blocked = OFFICIAL_RESOURCE_CORPUS.filter(
      (entry) => entry.placeability.status !== "placeable"
    );

    expect(artifact.source.order).toBe("base-standard.modinfo Resources row order");
    expect(rubies?.staticResourceRowSlot).toBe(44);
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
      if (row === undefined) {
        throw new Error(`Official resource evidence is missing ${entry.resourceType}`);
      }
      const rowContext = `${entry.resourceType} official resource evidence`;
      const sourceFile = requireAttribute(row, "sourceFile", rowContext);
      expect(entry.name).toBe(requireAttribute(row, "Name", rowContext));
      expect(entry.tooltip).toBe(requireAttribute(row, "Tooltip", rowContext));
      expect(entry.staticSource).toEqual({ file: sourceFile, table: "Resources" });
      expect(entry.baseClass).toBe(
        requireOfficialValue(row.ResourceClassType, "RESOURCECLASS_", rowContext)
      );
      expect(entry.weight).toBe(Number(requireAttribute(row, "Weight", rowContext)));
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
          ? [{ file: sourceFile, table: "Resource_ValidBiomes" }]
          : []
      );
      expect(entry.yieldChanges).toEqual(facts.yields.get(entry.resourceType) ?? []);
      expect(entry.typeTags).toEqual(facts.tags.get(entry.resourceType) ?? []);
      expect(entry.officialPlacementConstraints.placementFlags).toEqual(normalizeDistribution(row));
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

describe("resource runtime id proof", () => {
  it("proves every corpus symbolic id against the generated policy tables", () => {
    const resolution = resolveResourceRuntimeIds();
    expect(resolution.status).toBe("verified");
    expect(resolution.checkedCount).toBe(OFFICIAL_RESOURCE_CORPUS.length);
    expect(resolution.byType.size).toBe(OFFICIAL_RESOURCE_CORPUS.length);
    expect(resolution.byId.size).toBe(OFFICIAL_RESOURCE_CORPUS.length);
  });

  it("carries official Weight / MinimumPerHemisphere / required-age facts", () => {
    const gold = requireResourceRuntimeId("RESOURCE_GOLD");
    expect(gold.weight).toBe(20);
    expect(gold.minimumPerHemisphere).toBe(8);
    expect(gold.requiredForAges).toContain("AGE_ANTIQUITY");

    const hides = requireResourceRuntimeId("RESOURCE_HIDES");
    expect(hides.weight).toBe(40);

    const fish = requireResourceRuntimeId("RESOURCE_FISH");
    expect(fish.requiredForAges).toContain("AGE_ANTIQUITY");
  });

  it("hard-fails on unresolvable symbolic ids instead of degrading", () => {
    expect(() => requireResourceRuntimeId("RESOURCE_DOES_NOT_EXIST" as never)).toThrow(
      /No proven runtime id/
    );
  });
});
