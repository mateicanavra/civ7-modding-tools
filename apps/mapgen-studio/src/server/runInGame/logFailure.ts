export type Civ7MapgenLogFailure = Readonly<{
  code: "map-script-load-failed" | "map-generation-script-failed";
  message: string;
  mapScript?: string;
  matchedLogLine: string;
  dismissNotificationRequired: true;
  recoveryBoundary: "civ-notification-dismiss";
  recoveryHint: string;
}>;

function firstMatchingLine(text: string, patterns: ReadonlyArray<RegExp>): string | undefined {
  for (const line of text.split(/\r?\n/)) {
    if (patterns.some((pattern) => pattern.test(line))) return line.trim();
  }
  return undefined;
}

export function classifyCiv7MapgenLogFailure(
  freshLogText: string,
  options: { mapScript?: string } = {},
): Civ7MapgenLogFailure | undefined {
  const mapScriptLoadLine = firstMatchingLine(freshLogText, [
    /Failed to open file - .*\.js\b/i,
    /Failed to load file into script system - .*\.js\b/i,
  ]);
  if (mapScriptLoadLine) {
    return {
      code: "map-script-load-failed",
      message: options.mapScript
        ? `Civ7 could not load generated map script ${options.mapScript}`
        : "Civ7 could not load the generated map script",
      mapScript: options.mapScript,
      matchedLogLine: mapScriptLoadLine,
      dismissNotificationRequired: true,
      recoveryBoundary: "civ-notification-dismiss",
      recoveryHint: "Dismiss the Civ fatal notification, fix or regenerate the map script, then retry Run in Game.",
    };
  }

  const generationLine = firstMatchingLine(freshLogText, [
    /\bStepExecutionError\b/i,
    /\b(?:Uncaught|Exception|Error)\b/i,
  ]);
  if (generationLine && /(?:MapGeneration|\[SWOOPER_MOD\]|\[recipe:)/i.test(freshLogText)) {
    return {
      code: "map-generation-script-failed",
      message: "Civ7 loaded the map script, but the map generation script failed",
      mapScript: options.mapScript,
      matchedLogLine: generationLine,
      dismissNotificationRequired: true,
      recoveryBoundary: "civ-notification-dismiss",
      recoveryHint: "Dismiss the Civ fatal notification, correct the authored generation failure, then retry Run in Game.",
    };
  }

  return undefined;
}
