import { battlefieldScanSource } from "./battlefield";
import { Civ7DirectControlError } from "../../direct-control-error";

import type {
  Civ7CommandResult,
  Civ7DestinationAnalysisInput,
  Civ7DestinationAnalysisResult,
  Civ7DirectControlOptions,
  Civ7MapLocation,
} from "../../index";

type DestinationAnalysisDependencies = Readonly<{
  validatePlayerId: (playerId: number) => void;
  validateMapLocation: (location: Civ7MapLocation) => void;
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  parseDestinationAnalysis: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7DestinationAnalysisResult;
}>;

export async function getCiv7DestinationAnalysis(
  input: Civ7DestinationAnalysisInput,
  options: Civ7DirectControlOptions = {},
  dependencies: DestinationAnalysisDependencies,
): Promise<Civ7DestinationAnalysisResult> {
  if (input.playerId !== undefined) dependencies.validatePlayerId(input.playerId);
  dependencies.validateMapLocation(input.destination);
  if (input.origin !== undefined) dependencies.validateMapLocation(input.origin);
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildDestinationAnalysisCommand({
      ...input,
      corridorRadius: dependencies.boundedInteger(input.corridorRadius ?? 2, 0, 8, "corridorRadius"),
      destinationRadius: dependencies.boundedInteger(input.destinationRadius ?? 4, 1, 16, "destinationRadius"),
      maxPlayers: dependencies.boundedInteger(input.maxPlayers ?? 32, 1, 128, "maxPlayers"),
      maxUnits: dependencies.boundedInteger(input.maxUnits ?? 96, 1, 256, "maxUnits"),
      maxCities: dependencies.boundedInteger(input.maxCities ?? 40, 1, 128, "maxCities"),
    }),
  });
  return dependencies.parseDestinationAnalysis(result, "Civ7 destination analysis");
}

function buildDestinationAnalysisCommand(input: Civ7DestinationAnalysisInput & {
  corridorRadius: number;
  destinationRadius: number;
  maxPlayers: number;
  maxUnits: number;
  maxCities: number;
}): string {
  return `(() => {
    ${destinationAnalysisSource()}
    return JSON.stringify(readDestinationAnalysis(${jsLiteral(input)}));
  })()`;
}

function jsLiteral(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) {
    throw new Civ7DirectControlError("command-failed", "Cannot serialize Civ7 command input");
  }
  return json;
}

export function destinationAnalysisSource(): string {
  return `${battlefieldScanSource()}
    const sampleRoute = (origin, destination) => {
      if (!origin || !destination) return [];
      const dx = destination.x - origin.x;
      const dy = destination.y - origin.y;
      const steps = Math.max(Math.abs(dx), Math.abs(dy));
      if (steps === 0) return [destination];
      const out = [];
      const seen = {};
      for (let i = 0; i <= steps; i += 1) {
        const x = Math.round(origin.x + (dx * i) / steps);
        const y = Math.round(origin.y + (dy * i) / steps);
        const key = x + "," + y;
        if (seen[key]) continue;
        seen[key] = true;
        out.push({ x, y });
      }
      return out;
    };
    const minDistanceToRoute = (location, samples) => {
      if (!location || !Array.isArray(samples) || samples.length === 0) return null;
      let best = null;
      for (const sample of samples) {
        const value = distance(location, sample);
        if (value == null) continue;
        if (best == null || value < best) best = value;
      }
      return best;
    };
    const plotSnapshot = (location, playerId) => {
      if (!location) return null;
      const valid = probe(() => GameplayMap.isValidXY(location.x, location.y));
      return {
        location,
        valid,
        revealedState: probe(() => GameplayMap.getRevealedState(playerId, location.x, location.y)),
        owner: probe(() => GameplayMap.getOwner(location.x, location.y)),
        ownerName: probe(() => GameplayMap.getOwnerName(location.x, location.y)),
        water: probe(() => GameplayMap.isWater(location.x, location.y)),
        terrain: probe(() => GameplayMap.getTerrainType(location.x, location.y)),
        feature: probe(() => GameplayMap.getFeatureType(location.x, location.y)),
      };
    };
    const limitedSamples = (samples, playerId) => {
      if (samples.length <= 18) return samples.map((location) => plotSnapshot(location, playerId));
      const out = [];
      const step = Math.max(1, Math.floor(samples.length / 18));
      for (let i = 0; i < samples.length; i += step) out.push(plotSnapshot(samples[i], playerId));
      const last = samples[samples.length - 1];
      if (out.length === 0 || !out[out.length - 1] || out[out.length - 1].location.x !== last.x || out[out.length - 1].location.y !== last.y) {
        out.push(plotSnapshot(last, playerId));
      }
      return out.slice(0, 24);
    };
    const makeDestinationPoints = (playerId, corridorUnits, destinationUnits, destinationCities, corridorRadius) => {
      const points = [];
      const otherDestination = destinationUnits.filter((unit) => unit.owner !== playerId);
      const otherCorridor = corridorUnits.filter((unit) => unit.owner !== playerId);
      const friendlyDestination = destinationUnits.filter((unit) => unit.owner === playerId);
      if (otherDestination.length > 0) points.push({
        kind: "destination-pressure",
        severity: otherDestination.length >= 3 ? "high" : "medium",
        location: otherDestination[0].location,
        summary: otherDestination.length + " other-owner units near destination",
        units: otherDestination.slice(0, 8),
      });
      if (otherCorridor.length > 0) points.push({
        kind: "corridor-contact",
        severity: otherCorridor.length >= 4 ? "high" : "medium",
        location: otherCorridor[0].location,
        summary: otherCorridor.length + " other-owner units within corridor radius " + corridorRadius,
        units: otherCorridor.slice(0, 8),
      });
      const otherOwnerCities = destinationCities.filter((city) => city.owner !== playerId);
      if (otherOwnerCities.length > 0) points.push({
        kind: "destination-city-pressure",
        severity: otherOwnerCities[0].distance <= 3 ? "high" : "medium",
        location: otherOwnerCities[0].location,
        summary: "relationship-unproven city near intended destination",
        cities: otherOwnerCities.slice(0, 4),
      });
      if (friendlyDestination.length === 0 && (otherDestination.length > 0 || otherOwnerCities.length > 0)) points.push({
        kind: "unsupported-destination",
        severity: "medium",
        location: otherDestination[0]?.location ?? otherOwnerCities[0]?.location ?? null,
        summary: "destination pressure has no friendly unit already near the endpoint",
      });
      const exposedCivilian = corridorUnits.filter((unit) => unit.owner === playerId && unit.role === "civilian" && otherCorridor.some((contact) => distance(unit.location, contact.location) <= 4));
      if (exposedCivilian.length > 0) points.push({
        kind: "civilian-route-risk",
        severity: "high",
        location: exposedCivilian[0].location,
        summary: "friendly civilian in or near the corridor has other-owner contact within 4 tiles",
        units: exposedCivilian.slice(0, 4),
      });
      return points;
    };
    const readDestinationAnalysis = (input) => {
      const localPlayerId = GameContext.localPlayerID;
      const playerId = Number.isInteger(input.playerId) ? input.playerId : localPlayerId;
      const destination = toLocation(input.destination);
      if (!destination) throw new Error("destination is required");
      const requestedOrigin = toLocation(input.origin);
      const fallbackOrigins = requestedOrigin ? [requestedOrigin] : collectOrigins(input, playerId).slice(0, 1);
      const origin = fallbackOrigins[0] ?? null;
      const samples = origin ? sampleRoute(origin, destination) : [];
      const scanRadius = origin
        ? Math.min(64, Math.max(distance(origin, destination) ?? input.destinationRadius, input.destinationRadius) + input.corridorRadius)
        : input.destinationRadius;
      const scanOrigins = origin ? [origin, destination] : [destination];
      const scan = readBattlefieldScan({
        ...input,
        origins: scanOrigins,
        radius: scanRadius,
      });
      const units = Array.isArray(scan.units) ? scan.units : [];
      const cities = Array.isArray(scan.cities) ? scan.cities : [];
      const corridorUnits = origin
        ? units.map((unit) => ({ ...unit, corridorDistance: minDistanceToRoute(unit.location, samples) }))
          .filter((unit) => unit.corridorDistance != null && unit.corridorDistance <= input.corridorRadius)
          .sort((a, b) => a.corridorDistance - b.corridorDistance || a.distance - b.distance)
        : [];
      const destinationUnits = units.map((unit) => ({ ...unit, destinationDistance: distance(unit.location, destination) }))
        .filter((unit) => unit.destinationDistance != null && unit.destinationDistance <= input.destinationRadius)
        .sort((a, b) => a.destinationDistance - b.destinationDistance || b.strength - a.strength);
      const destinationCities = cities.map((city) => ({ ...city, destinationDistance: distance(city.location, destination) }))
        .filter((city) => city.destinationDistance != null && city.destinationDistance <= input.destinationRadius)
        .sort((a, b) => a.destinationDistance - b.destinationDistance);
      const otherDestinationStrength = destinationUnits
        .filter((unit) => unit.owner !== playerId)
        .reduce((sum, unit) => sum + (Number(unit.strength) || 0), 0);
      return {
        localPlayerId,
        playerId,
        origin,
        destination,
        corridorRadius: input.corridorRadius,
        destinationRadius: input.destinationRadius,
        hiddenInfoPolicy: "runtime-debug-summary; may include non-visible units, cities, or plot state until paired with visibility/map reads",
        relationshipLabelPolicy: scan.relationshipLabelPolicy,
        corridor: {
          routeHint: origin ? "straight-line-grid-corridor" : "destination-only-no-origin",
          directGridDistance: origin ? distance(origin, destination) : null,
          sampleCount: samples.length,
          sampledPlots: limitedSamples(samples, playerId),
          units: corridorUnits.slice(0, input.maxUnits),
          unitCount: corridorUnits.length,
        },
        destinationPressure: {
          units: destinationUnits.slice(0, input.maxUnits),
          unitCount: destinationUnits.length,
          cities: destinationCities.slice(0, input.maxCities),
          cityCount: destinationCities.length,
          apparentOtherStrength: Math.round(otherDestinationStrength * 10) / 10,
        },
        pointsOfInterest: makeDestinationPoints(playerId, corridorUnits, destinationUnits, destinationCities, input.corridorRadius),
        notes: [
          "Read-only destination lens for tactical planning. It does not move units, reserve paths, attack, or validate operations.",
          "The corridor is a straight-line grid approximation, not Civ7 engine pathfinding. Use ready-unit, map/visibility, and movement validators before sends.",
          "Use this lens to decide what needs inspection before movement: other-owner contact, exposed civilians, unsupported endpoints, and plot-state surprises.",
          "Relationship labels are not classified here. Treat owner/proximity pressure as relationship-unproven until official relationship or operation evidence proves more.",
        ],
      };
    };`;
}
