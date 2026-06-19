export interface GeneratedZone {
  id: string;
  kind: "prefix" | "exact";
  path: string;
  remediation: string;
}

export const generatedZones: GeneratedZone[] = [
  {
    id: "swooper-map-generated",
    kind: "prefix",
    path: "mods/mod-swooper-maps/src/maps/generated/",
    remediation: "Run `nx run mod-swooper-maps:gen:maps` and commit the generated output.",
  },
  {
    id: "civ7-types-generated",
    kind: "prefix",
    path: "packages/civ7-types/generated/",
    remediation:
      "Regenerate through the external Civ7 resources workflow; this repo cannot regenerate those types in CI.",
  },
  {
    id: "civ7-map-policy-tables",
    kind: "exact",
    path: "packages/civ7-map-policy/src/civ7-tables.gen.ts",
    remediation: "Run `nx run @civ7/map-policy:verify -- --write` and commit the generated table.",
  },
];

export function generatedZoneById(id: string): GeneratedZone | undefined {
  return generatedZones.find((zone) => zone.id === id);
}

export function matchesGeneratedZone(zone: GeneratedZone, candidate: string): boolean {
  if (zone.kind === "exact") return candidate === zone.path;
  return candidate.startsWith(zone.path);
}

export function isGeneratedZoneRoot(relative: string): boolean {
  return generatedZones.some((zone) => {
    if (zone.kind === "exact") return relative === zone.path;
    return relative === zone.path.slice(0, -1) || relative.startsWith(zone.path);
  });
}
