function probeHelperSource(): string {
  return `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;
}

export function settlementRecommendationsSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value) return null;
      const owner = Number(value.owner ?? value.Owner ?? value.player ?? value.Player);
      const id = Number(value.id ?? value.ID);
      const type = Number(value.type ?? value.Type);
      if (!Number.isFinite(owner) || !Number.isFinite(id) || !Number.isFinite(type)) return null;
      return { owner, id, type };
    };
    const toLocation = (value) => {
      if (!value) return null;
      const x = Number(value.x ?? value.X);
      const y = Number(value.y ?? value.Y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
      return { x, y };
    };
    const plotIndexFor = (location) => probe(() => GameplayMap.getIndexFromLocation(location));
    const factorSummary = (factor) => ({
      positive: !!factor?.positive,
      title: factor?.title ?? null,
      description: factor?.description ?? null,
    });
    const suggestionSummary = (suggestion) => {
      const location = toLocation(suggestion?.location);
      return {
        location,
        plotIndex: location ? plotIndexFor(location) : { ok: false, error: "missing suggestion location" },
        factors: Array.isArray(suggestion?.factors)
          ? suggestion.factors.map(factorSummary).sort((a, b) => a.positive && !b.positive ? -1 : 1)
          : [],
      };
    };
    const requestedOrigins = (locations) => Array.isArray(locations)
      ? locations.map(toLocation).filter(Boolean).map((location) => ({
        kind: "requested",
        location,
        plotIndex: plotIndexFor(location),
      }))
      : [];
    const settlerOrigins = (player, includeSettlers) => {
      if (includeSettlers === false) return [];
      const units = player?.Units?.getUnits?.() ?? [];
      return units.filter((unit) => GameInfo.Units.lookup(unit.type)?.FoundCity).map((unit) => ({
        kind: "settler",
        location: unit.location,
        plotIndex: plotIndexFor(unit.location),
        unitId: toComponentId(unit.id),
        name: GameInfo.Units.lookup(unit.type)?.UnitType ?? null,
      }));
    };
    const cityOrigins = (player, includeCities) => {
      if (includeCities === false) return [];
      const cities = player?.Cities?.getCities?.() ?? [];
      return cities.map((city) => ({
        kind: "city",
        location: city.location,
        plotIndex: plotIndexFor(city.location),
        cityId: toComponentId(city.id),
        name: city.name ?? null,
      }));
    };
    const readSettlementRecommendations = (input) => {
      const localPlayerId = GameContext.localPlayerID;
      const playerId = Number.isInteger(input.playerId) ? input.playerId : localPlayerId;
      const player = Players.get(playerId);
      const count = Number.isInteger(input.count) ? input.count : 5;
      const requested = requestedOrigins(input.locations);
      const origins = requested.length > 0
        ? requested
        : [...settlerOrigins(player, input.includeSettlers), ...cityOrigins(player, input.includeCities)];
      const recommendations = origins.map((origin) => ({
        origin,
        suggestions: probe(() => (player?.AI?.getBestSettleLocationsForSettler?.(count, origin.location) ?? []).map(suggestionSummary)),
      }));
      return {
        localPlayerId,
        playerId,
        count,
        requestedLocations: Array.isArray(input.locations) ? input.locations.map(toLocation).filter(Boolean) : [],
        origins,
        recommendations,
        notes: [
          "Read-only settlement recommendation view. It wraps the official settlement lens API, not a city-founding operation.",
          "Recommendations are local-player AI advice for ranking candidate plots; use unit-target/ready-unit validation before moving a Settler.",
          "Official settlement lens seeds recommendations from Settler and city origins; pass --x/--y to focus one live Settler or formation."
        ],
      };
    };`;
}
