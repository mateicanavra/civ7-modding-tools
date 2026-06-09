const probeHelperSource = (): string => `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;

export function progressDashboardSource(): string {
  return `${probeHelperSource()}
    const loc = (key) => {
      if (key == null || key === "") return null;
      try {
        return typeof Locale !== "undefined" && Locale.compose ? Locale.compose(key) : String(key);
      } catch {
        return String(key);
      }
    };
    const rows = (table) => {
      try {
        return Array.from(table ?? []);
      } catch {
        return [];
      }
    };
    const safeNumber = (value) => Number.isFinite(value) ? value : null;
    const currentAge = () => {
      const ageHash = probe(() => Game.age);
      const definition = ageHash.ok ? probe(() => GameInfo.Ages.lookup(ageHash.value)).value ?? null : null;
      return {
        hash: ageHash.ok ? ageHash.value : null,
        ageType: definition?.AgeType ?? null,
        name: loc(definition?.Name ?? definition?.AgeType ?? null),
        chronologyIndex: definition?.ChronologyIndex ?? null,
        isFinalAge: probe(() => Game.AgeProgressManager.isFinalAge),
        isSingleAge: probe(() => Game.AgeProgressManager.isSingleAge),
        isExtendedGame: probe(() => Game.AgeProgressManager.isExtendedGame),
        isAgeOver: probe(() => typeof Game.AgeProgressManager.isAgeOver === "function"
          ? Game.AgeProgressManager.isAgeOver()
          : Game.AgeProgressManager.isAgeOver),
        currentAgeProgressionPoints: probe(() => Game.AgeProgressManager.getCurrentAgeProgressionPoints()),
        maxAgeProgressionPoints: probe(() => Game.AgeProgressManager.getMaxAgeProgressionPoints()),
        primaryAgeProgression: probe(() => Game.AgeProgressManager.getPrimaryAgeProgression()),
      };
    };
    const enabledPathHashes = (player) => {
      const enabled = probe(() => player.LegacyPaths?.getEnabledLegacyPaths?.()).value;
      return Array.isArray(enabled)
        ? enabled.map((entry) => entry?.legacyPath).filter((value) => Number.isFinite(value))
        : [];
    };
    const summarizeMilestone = (row, score) => {
      const complete = probe(() => Game.AgeProgressManager.isMilestoneComplete(row.AgeProgressionMilestoneType));
      const progressionPoints = probe(() => Game.AgeProgressManager.getMilestoneProgressionPoints(row.AgeProgressionMilestoneType));
      const required = safeNumber(row.RequiredPathPoints);
      return {
        ageProgressionMilestoneType: row.AgeProgressionMilestoneType ?? null,
        legacyPathType: row.LegacyPathType ?? null,
        requiredPathPoints: required,
        finalMilestone: row.FinalMilestone === true,
        progressionPoints,
        complete,
        reachedByScore: typeof score === "number" && typeof required === "number" ? score >= required : null,
      };
    };
    const summarizeLegacyPath = (player, path, enabledHashes) => {
      const score = probe(() => player.LegacyPaths?.getScore?.(path.LegacyPathType));
      const scoreValue = score.ok && Number.isFinite(score.value) ? score.value : null;
      const milestones = rows(GameInfo.AgeProgressionMilestones)
        .filter((milestone) => milestone?.LegacyPathType === path.LegacyPathType)
        .sort((left, right) => (left.RequiredPathPoints ?? 0) - (right.RequiredPathPoints ?? 0))
        .map((milestone) => summarizeMilestone(milestone, scoreValue));
      const final = milestones.find((milestone) => milestone.finalMilestone) ?? milestones[milestones.length - 1] ?? null;
      const nextMilestone = milestones.find((milestone) =>
        milestone.complete?.ok ? milestone.complete.value !== true : milestone.reachedByScore !== true
      ) ?? null;
      return {
        legacyPathType: path.LegacyPathType ?? null,
        legacyPathClassType: path.LegacyPathClassType ?? null,
        ageType: path.Age ?? null,
        name: loc(path.Name ?? path.LegacyPathType ?? null),
        description: loc(path.Description ?? null),
        enabledByDefault: path.EnabledByDefault === true,
        enabledForPlayer: enabledHashes.length > 0 ? enabledHashes.includes(path.$hash) : null,
        score,
        finalRequiredPathPoints: final?.requiredPathPoints ?? null,
        nextMilestone,
        milestones,
      };
    };
    const readProgressDashboard = (input) => {
      const playerId = input.playerId ?? GameContext.localPlayerID;
      const player = Players.get(playerId);
      if (!player) throw new Error("Player is unavailable for player " + playerId);
      const age = currentAge();
      const enabledHashes = enabledPathHashes(player);
      const legacyPaths = rows(GameInfo.LegacyPaths)
        .filter((path) => !age.ageType || path.Age === age.ageType)
        .filter((path) => path.EnabledByDefault === true || enabledHashes.includes(path.$hash))
        .map((path) => summarizeLegacyPath(player, path, enabledHashes));
      const victoryRows = rows(GameInfo.Victories).map((victory) => ({
        victoryType: victory.VictoryType ?? null,
        victoryClassType: victory.VictoryClassType ?? null,
        name: loc(victory.Name ?? victory.VictoryType ?? null),
        description: loc(victory.Description ?? null),
      }));
      const triumphRows = rows(GameInfo.Triumphs).map((triumph) => ({
        type: triumph.TriumphType ?? triumph.Type ?? null,
        name: loc(triumph.Name ?? triumph.TriumphType ?? triumph.Type ?? null),
        description: loc(triumph.Description ?? null),
      }));
      return {
        localPlayerId: GameContext.localPlayerID,
        playerId,
        turn: probe(() => Game.turn),
        turnDate: probe(() => Game.getTurnDate()),
        age,
        player: {
          team: player.team ?? null,
          historicalLegacyPointCountForTeam: probe(() => Game.AgeProgressManager.getHistoricalLegacyPointCountForTeam(player.team)),
        },
        legacyPaths,
        victories: {
          rows: victoryRows,
        },
        triumphs: {
          count: triumphRows.length,
          rows: triumphRows,
          source: "runtime-gameinfo",
        },
        proof: {
          victoryManagerGlobal: probe(() => typeof VictoryManager),
          sources: [
            "GameInfo.LegacyPaths",
            "player.LegacyPaths.getScore",
            "GameInfo.AgeProgressionMilestones",
            "Game.AgeProgressManager",
            "GameInfo.Victories",
            "GameInfo.Triumphs",
          ],
        },
        hiddenInfoPolicy: "local-player-runtime-progress",
        notes: [
          "Read-only progress dashboard; it does not choose technologies, civics, productions, policies, or victory strategy.",
          "Legacy path scores come from the local player's LegacyPaths component and milestone thresholds come from GameInfo.AgeProgressionMilestones.",
          "VictoryManager is module-local in the official UI and may not be globally available through direct App UI eval; this wrapper uses the official lower-level runtime APIs exposed to App UI.",
          "Triumph rows are reported from runtime GameInfo.Triumphs. An empty table means no runtime triumph rows were available from this read, not that rewards are impossible elsewhere.",
        ],
      };
    };`;
}
