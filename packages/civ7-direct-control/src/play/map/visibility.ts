import { Civ7DirectControlError } from "../../direct-control-error";

import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7MapBounds,
  Civ7VisibilitySummaryInput,
  Civ7VisibilitySummaryResult,
} from "../../index";

type VisibilityReadDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  defaultMapGridMaxPlots: number;
  executeTunerCommand: (options: Civ7DirectControlOptions & Readonly<{ command: string }>) => Promise<Civ7CommandResult>;
  hardMapGridMaxPlots: number;
  jsLiteral: (value: unknown) => string;
  parseVisibilitySummary: (result: Civ7CommandResult, label: string) => Civ7VisibilitySummaryResult;
  probeHelperSource: () => string;
  validateMapBounds: (bounds: Civ7MapBounds) => void;
  validatePlayerId: (playerId: number) => number;
}>;

export async function getCiv7VisibilitySummary(
  input: Civ7VisibilitySummaryInput,
  options: Civ7DirectControlOptions = {},
  dependencies: VisibilityReadDependencies,
): Promise<Civ7VisibilitySummaryResult> {
  dependencies.validatePlayerId(input.playerId);
  const maxPlots = dependencies.boundedInteger(
    input.maxPlots ?? dependencies.defaultMapGridMaxPlots,
    1,
    dependencies.hardMapGridMaxPlots,
    "maxPlots",
  );
  if (input.includeGrid && !input.bounds) {
    throw new Civ7DirectControlError("command-failed", "Visibility grid reads require explicit bounds");
  }
  if (input.bounds) dependencies.validateMapBounds(input.bounds);
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildVisibilitySummaryCommand(
      {
        ...input,
        maxPlots,
      },
      dependencies,
    ),
  });
  return dependencies.parseVisibilitySummary(result, "Civ7 visibility summary");
}

function buildVisibilitySummaryCommand(
  input: Civ7VisibilitySummaryInput & { maxPlots: number },
  dependencies: VisibilityReadDependencies,
): string {
  return `(() => {
    ${dependencies.probeHelperSource()}
    const input = ${dependencies.jsLiteral(input)};
    const readState = (x, y) => probe(() => GameplayMap.getRevealedState(input.playerId, x, y));
    const readVisible = (x, y) => probe(() => typeof Visibility !== "undefined" && typeof Visibility.isVisible === "function"
      ? Visibility.isVisible(input.playerId, x, y)
      : false);
    const counts = {};
    const statesFromBounds = () => {
      if (!input.bounds) return [];
      const out = [];
      outer: for (let y = input.bounds.y; y < input.bounds.y + input.bounds.height; y += 1) {
        for (let x = input.bounds.x; x < input.bounds.x + input.bounds.width; x += 1) {
          const state = readState(x, y);
          const key = state.ok ? String(state.value) : "error";
          counts[key] = (counts[key] ?? 0) + 1;
          out.push({ x, y, state, visible: readVisible(x, y) });
          if (out.length >= input.maxPlots) break outer;
        }
      }
      return out;
    };
    const gridStates = input.includeGrid ? statesFromBounds() : [];
    const requestedCount = input.bounds ? input.bounds.width * input.bounds.height : gridStates.length;
    return JSON.stringify({
      playerId: input.playerId,
      numPlotsRevealed: probe(() => typeof Visibility !== "undefined" && typeof Visibility.getPlotsRevealedCount === "function"
        ? Visibility.getPlotsRevealedCount(input.playerId)
        : Players.LiveOpsStats.get(input.playerId).numPlotsRevealed),
      numPlotsVisible: probe(() => typeof Visibility !== "undefined" && typeof Visibility.getPlotsVisibleCount === "function"
        ? Visibility.getPlotsVisibleCount(input.playerId)
        : 0),
      counts,
      ...(input.includeGrid ? {
        grid: {
          bounds: input.bounds,
          plotCount: requestedCount,
          omitted: Math.max(0, requestedCount - gridStates.length),
          states: gridStates,
        },
      } : {}),
    });
  })()`;
}
