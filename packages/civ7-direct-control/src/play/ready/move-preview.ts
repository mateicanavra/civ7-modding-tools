const probeHelperSource = (): string => `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;

export function unitMovePreviewSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
      return out;
    };
    const normalizeLocation = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.x !== "number" || typeof value.y !== "number") return null;
      return { x: value.x, y: value.y };
    };
    const plotFromIndex = (index) => {
      try {
        const location = GameplayMap.getLocationFromIndex(index);
        return { index, x: location?.x ?? null, y: location?.y ?? null };
      } catch (err) {
        return { index, error: String(err) };
      }
    };
    const normalizePlotCollection = (value, maxPlots) => {
      const items = Array.isArray(value) ? value : [];
      let count = 0;
      const normalize = (entry) => {
        if (typeof entry === "number") {
          count += 1;
          return plotFromIndex(entry);
        }
        if (Array.isArray(entry)) {
          const out = [];
          for (const item of entry) {
            if (count >= maxPlots) break;
            out.push(normalize(item));
          }
          return out;
        }
        return entry;
      };
      const out = [];
      for (const item of items) {
        if (count >= maxPlots) break;
        out.push(normalize(item));
      }
      return out;
    };
    const summarizePath = (result, maxPathPlots) => {
      if (!result || typeof result !== "object") return result ?? null;
      const plots = Array.isArray(result.plots)
        ? result.plots
        : Array.isArray(result.Plots)
          ? result.Plots
          : [];
      return {
        plots: normalizePlotCollection(plots, maxPathPlots),
        plotCount: plots.length,
        turns: result.turns ?? result.Turns ?? null,
        obstacles: result.obstacles ?? result.Obstacles ?? null,
        rawKeys: Object.keys(result).sort(),
      };
    };
    const summarizeUnit = (unitId) => {
      const unit = Units.get(unitId);
      if (!unit) return null;
      const movement = unit.Movement;
      const combat = unit.Combat;
      const health = unit.Health;
      const type = unit.type ?? null;
      const typeDef = (() => {
        try {
          return type == null ? null : GameInfo.Units.lookup(type);
        } catch {
          return null;
        }
      })();
      return {
        id: toComponentId(unit.id ?? unitId),
        owner: unit.owner ?? unitId.owner,
        type,
        typeName: typeDef?.UnitType ?? null,
        location: unit.location ?? null,
        movementMovesRemaining: movement?.movementMovesRemaining ?? null,
        movementTurnsRemaining: movement?.movementTurnsRemaining ?? null,
        attacksRemaining: combat?.attacksRemaining ?? null,
        rangedStrength: combat?.rangedStrength ?? null,
        bombardStrength: combat?.bombardStrength ?? null,
        meleeStrength: typeof combat?.getMeleeStrength === "function" ? combat.getMeleeStrength(false) : null,
        damage: health?.damage ?? null,
        hitPoints: health?.hitPoints ?? null,
        activity: unit.Activity?.activityType ?? unit.activityType ?? null,
      };
    };
    const safeReachableMovement = (unitId, maxPlots) => normalizePlotCollection(Units.getReachableMovement(unitId) ?? [], maxPlots);
    const safeReachableZoc = (unitId, maxPlots) => normalizePlotCollection(Units.getReachableZonesOfControl(unitId, true) ?? [], maxPlots);
    const safeReachableTargets = (unitId, maxPlots) => normalizePlotCollection(Units.getReachableTargets(unitId) ?? [], maxPlots);
    const readUnitMovePreview = (input) => {
      const selectedUnitId = probe(() => toComponentId(UI?.Player?.getHeadSelectedUnit?.()));
      const firstReadyUnitId = probe(() => toComponentId(UI?.Player?.getFirstReadyUnit?.()));
      const requestedUnitId = toComponentId(input.unitId);
      const unitId = requestedUnitId
        ?? (selectedUnitId.ok ? selectedUnitId.value : null)
        ?? (firstReadyUnitId.ok ? firstReadyUnitId.value : null);
      const requestedDestination = normalizeLocation(input.destination);
      return {
        localPlayerId: GameContext.localPlayerID,
        requestedUnitId,
        selectedUnitId,
        firstReadyUnitId,
        unitId,
        unit: probe(() => unitId ? summarizeUnit(unitId) : null),
        reachableMovement: probe(() => unitId ? safeReachableMovement(unitId, input.maxPlots) : []),
        reachableZonesOfControl: probe(() => unitId ? safeReachableZoc(unitId, input.maxPlots) : []),
        reachableTargets: probe(() => unitId ? safeReachableTargets(unitId, input.maxPlots) : []),
        queuedDestination: probe(() => unitId ? normalizeLocation(Units.getQueuedOperationDestination(unitId)) : null),
        queuedPath: probe(() => {
          if (!unitId) return null;
          const destination = normalizeLocation(Units.getQueuedOperationDestination(unitId));
          return destination ? summarizePath(Units.getPathTo(unitId, destination), input.maxPathPlots) : null;
        }),
        requestedDestination,
        requestedPath: probe(() => unitId && requestedDestination ? summarizePath(Units.getPathTo(unitId, requestedDestination), input.maxPathPlots) : null),
        relationshipPolicy: {
          relationshipSource: "not-classified",
          relationshipProof: "none",
          unprovenLabel: "relationship-unproven",
          guidance: "This movement preview does not classify other-owner relationships. Use neutral labels unless an official relationship, team, diplomacy, independent-power, or war-state API supplies that proof.",
        },
        notes: [
          "Read-only official movement preview. It does not send MOVE_TO, reserve a path, or prove tactical safety.",
          "Reachable movement, targets, zones of control, queued destination, and path data come from the same Units preview APIs used by the Civ7 UI when available.",
          "Operation validators and postconditions remain authoritative before and after any send.",
          "Relationship labels are intentionally conservative: owner mismatch is contact evidence, not relationship proof."
        ],
      };
    };`;
}
