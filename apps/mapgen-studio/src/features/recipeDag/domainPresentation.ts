import {
  Blocks,
  createLucideIcon,
  Droplet,
  Flag,
  Leaf,
  MapPin,
  Package,
  Route,
  Settings2,
  SunSnow,
  type LucideIcon,
} from "lucide-react";

export type RecipeDagDomainPresentation = Readonly<{
  id: string;
  label: string;
  Icon: LucideIcon;
  lane: RecipeDagDomainLaneColors;
  strokeWidth?: number;
}>;

export type RecipeDagDomainLaneColors = Readonly<{
  lightFill: string;
  lightAccent: string;
  darkFill: string;
  darkAccent: string;
}>;

const Stone = createLucideIcon("Stone", [
  [
    "path",
    {
      d: "M11.264 2.205A4 4 0 0 0 6.42 4.211l-4 8a4 4 0 0 0 1.359 5.117l6 4a4 4 0 0 0 4.438 0l6-4a4 4 0 0 0 1.576-4.592l-2-6a4 4 0 0 0-2.53-2.53z",
      key: "stone-shell",
    },
  ],
  ["path", { d: "M11.99 22 14 12l7.822 3.184", key: "stone-crack-a" }],
  ["path", { d: "M14 12 8.47 2.302", key: "stone-crack-b" }],
]);

const Bolt = createLucideIcon("Bolt", [
  [
    "path",
    {
      d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
      key: "bolt-shell",
    },
  ],
  ["circle", { cx: "12", cy: "12", r: "4", key: "bolt-core" }],
]);

const LANE_COLORS: Record<string, RecipeDagDomainLaneColors> = {
  setup: {
    lightFill: "rgba(241,245,249,0.66)",
    lightAccent: "#64748b",
    darkFill: "rgba(51,65,85,0.18)",
    darkAccent: "#94a3b8",
  },
  foundation: {
    lightFill: "rgba(245,245,244,0.70)",
    lightAccent: "#78716c",
    darkFill: "rgba(87,83,78,0.20)",
    darkAccent: "#a8a29e",
  },
  morphology: {
    lightFill: "rgba(255,247,237,0.66)",
    lightAccent: "#b45309",
    darkFill: "rgba(146,64,14,0.18)",
    darkAccent: "#f59e0b",
  },
  hydrology: {
    lightFill: "rgba(239,246,255,0.70)",
    lightAccent: "#0284c7",
    darkFill: "rgba(14,116,144,0.19)",
    darkAccent: "#38bdf8",
  },
  ecology: {
    lightFill: "rgba(236,253,245,0.70)",
    lightAccent: "#16a34a",
    darkFill: "rgba(6,95,70,0.22)",
    darkAccent: "#34d399",
  },
  gameplay: {
    lightFill: "rgba(245,243,255,0.64)",
    lightAccent: "#7c3aed",
    darkFill: "rgba(91,33,182,0.17)",
    darkAccent: "#a78bfa",
  },
  placement: {
    lightFill: "rgba(255,241,242,0.62)",
    lightAccent: "#e11d48",
    darkFill: "rgba(159,18,57,0.16)",
    darkAccent: "#fb7185",
  },
  finish: {
    lightFill: "rgba(240,253,250,0.64)",
    lightAccent: "#0f766e",
    darkFill: "rgba(19,78,74,0.18)",
    darkAccent: "#2dd4bf",
  },
  climate: {
    lightFill: "rgba(240,249,255,0.66)",
    lightAccent: "#2563eb",
    darkFill: "rgba(30,64,175,0.18)",
    darkAccent: "#60a5fa",
  },
  routing: {
    lightFill: "rgba(250,245,255,0.62)",
    lightAccent: "#9333ea",
    darkFill: "rgba(107,33,168,0.16)",
    darkAccent: "#c084fc",
  },
  artifact: {
    lightFill: "rgba(248,250,252,0.62)",
    lightAccent: "#64748b",
    darkFill: "rgba(30,41,59,0.16)",
    darkAccent: "#94a3b8",
  },
};

const DOMAIN_PRESENTATIONS: Record<string, RecipeDagDomainPresentation> = {
  setup: { id: "setup", label: "Setup", Icon: Settings2, lane: LANE_COLORS.setup },
  foundation: { id: "foundation", label: "Foundation", Icon: Blocks, lane: LANE_COLORS.foundation },
  morphology: { id: "morphology", label: "Morphology", Icon: Stone, lane: LANE_COLORS.morphology, strokeWidth: 1.9 },
  hydrology: {
    id: "hydrology",
    label: "Hydrology",
    Icon: Droplet,
    lane: LANE_COLORS.hydrology,
    strokeWidth: 1.9,
  },
  ecology: {
    id: "ecology",
    label: "Ecology",
    Icon: Leaf,
    lane: LANE_COLORS.ecology,
    strokeWidth: 1.8,
  },
  gameplay: { id: "gameplay", label: "Gameplay", Icon: Bolt, lane: LANE_COLORS.gameplay },
  placement: { id: "placement", label: "Placement", Icon: MapPin, lane: LANE_COLORS.placement },
  finish: { id: "finish", label: "Finish", Icon: Flag, lane: LANE_COLORS.finish },
  climate: { id: "climate", label: "Climate", Icon: SunSnow, lane: LANE_COLORS.climate, strokeWidth: 1.8 },
  routing: { id: "routing", label: "Routing", Icon: Route, lane: LANE_COLORS.routing },
  artifact: { id: "artifact", label: "Artifact", Icon: Package, lane: LANE_COLORS.artifact },
};

const ORDERED_DOMAIN_IDS = [
  "setup",
  "foundation",
  "morphology",
  "hydrology",
  "ecology",
  "gameplay",
  "placement",
  "finish",
  "climate",
  "routing",
] as const;

export function getRecipeDagDomainPresentation(domainId: string | null): RecipeDagDomainPresentation {
  const normalized = normalizeRecipeDagDomainId(domainId);
  return DOMAIN_PRESENTATIONS[normalized] ?? DOMAIN_PRESENTATIONS.artifact;
}

export function getRecipeDagPhaseLaneColors(phaseId: string | null, lightMode: boolean): Readonly<{
  fill: string;
  accent: string;
}> {
  const lane = getRecipeDagDomainPresentation(phaseId).lane;
  return {
    fill: lightMode ? lane.lightFill : lane.darkFill,
    accent: lightMode ? lane.lightAccent : lane.darkAccent,
  };
}

export function normalizeRecipeDagDomainId(domainId: string | null): keyof typeof DOMAIN_PRESENTATIONS {
  const normalized = normalizeDomainText(domainId);
  if (!normalized) return "artifact";
  if (normalized.includes("shape")) return "morphology";
  if (normalized.includes("foundation") || normalized.includes("tectonic") || normalized.includes("plate")) return "foundation";
  if (
    normalized.includes("hydrology") ||
    normalized.includes("hydro") ||
    normalized.includes("river") ||
    normalized.includes("lake") ||
    normalized.includes("water")
  ) return "hydrology";
  if (normalized.includes("placement") || normalized.includes("start") || normalized.includes("discovery")) return "placement";
  if (normalized.includes("setup") || normalized.includes("config") || normalized.includes("input")) return "setup";
  if (
    normalized.includes("morphology") ||
    normalized.includes("terrain") ||
    normalized.includes("topography") ||
    normalized.includes("elevation") ||
    normalized.includes("coast") ||
    normalized.includes("landmass") ||
    normalized.includes("mountain") ||
    normalized.includes("volcano")
  ) return "morphology";
  if (
    normalized.includes("ecology") ||
    normalized.includes("biome") ||
    normalized.includes("soil") ||
    normalized.includes("vegetation") ||
    normalized.includes("wetland") ||
    normalized.includes("reef") ||
    normalized.includes("floodplain") ||
    normalized.includes("resource")
  ) return "ecology";
  if (
    normalized.includes("climate") ||
    normalized.includes("temperature") ||
    normalized.includes("rain") ||
    normalized.includes("wind") ||
    normalized.includes("cryosphere")
  ) return "climate";
  if (normalized.includes("route") || normalized.includes("routing") || normalized.includes("path")) return "routing";
  if (normalized.includes("gameplay") || normalized.includes("projection") || normalized.includes("engine")) return "gameplay";
  if (normalized.includes("finish") || normalized.includes("final")) return "finish";
  return "artifact";
}

export function chooseRecipeDagDomainId(candidates: readonly (string | null | undefined)[]): string | null {
  for (const candidate of candidates) {
    const normalized = normalizeRecipeDagDomainId(candidate ?? null);
    if (normalized !== "artifact") return normalized;
  }
  for (const fallback of ORDERED_DOMAIN_IDS) {
    if (candidates.some((candidate) => normalizeRecipeDagDomainId(candidate ?? null) === fallback)) return fallback;
  }
  return null;
}

function normalizeDomainText(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}
