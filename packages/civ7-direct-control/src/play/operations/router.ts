function probeHelperSource(): string {
  return `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;
}

export function operationRouterSource(): string {
  return `${probeHelperSource()}
    const readNumericField = (value, lowerKey, upperKey) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value[lowerKey] === "number") return value[lowerKey];
      if (typeof value[upperKey] === "number") return value[upperKey];
      return null;
    };
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      const owner = readNumericField(value, "owner", "Owner");
      const id = readNumericField(value, "id", "ID");
      if (owner == null || id == null) return null;
      const out = { owner, id };
      const type = readNumericField(value, "type", "Type");
      if (type != null) out.type = type;
      return out;
    };
    const summarizeUnitForPostcondition = (unit) => {
      if (!unit) return null;
      const location = unit.location ?? unit.Location ?? null;
      const movement = unit.Movement ?? unit.movement ?? unit.movementMovesRemaining ?? null;
      const activity = unit.Activity ?? unit.activity ?? unit.currentActivity ?? null;
      const damage = unit.Damage ?? unit.damage ?? null;
      const attacks = unit.Attacks ?? unit.attacks ?? unit.attackCharges ?? null;
      return {
        id: toComponentId(unit.id ?? unit.ID ?? unit.UnitId ?? unit.unitId),
        location,
        movement,
        activity,
        damage,
        attacks,
      };
    };
    const readUnitPostconditionSnapshot = (input) => ({
      unit: probe(() => summarizeUnitForPostcondition(globalThis.Units?.get?.(input.unitId))),
      selectedUnitId: probe(() => toComponentId(globalThis.UI?.Player?.getHeadSelectedUnit?.())),
      firstReadyUnitId: probe(() => toComponentId(globalThis.UI?.Player?.getFirstReadyUnit?.())),
      blocker: probe(() => globalThis.Game?.Notifications?.getEndTurnBlockingType?.(globalThis.GameContext?.localPlayerID)),
    });
    const unitPostconditionEligible = (family) => family === "unit-operation" || family === "unit-command";
    const readyPopulationCityId = () => {
      const player = globalThis.Players?.get?.(globalThis.GameContext?.localPlayerID);
      const cityIds = player?.Cities?.getCityIds?.() ?? [];
      for (const cityId of cityIds) {
        const city = globalThis.Cities?.get?.(cityId);
        if (city?.Growth?.isReadyToPlacePopulation) return toComponentId(cityId);
      }
      return null;
    };
    const populationPostconditionCityId = (family, input) => {
      if (family === "city-command" && input.operationType === "EXPAND") return toComponentId(input.cityId);
      if (family === "player-operation" && input.operationType === "ASSIGN_WORKER") return readyPopulationCityId();
      return null;
    };
    const populationPostconditionEligible = (family, input) => !!populationPostconditionCityId(family, input);
    const readPopulationPlacementPostconditionSnapshot = (cityId) => {
      const city = globalThis.Cities?.get?.(cityId);
      const placementInfo = city?.Workers?.GetAllPlacementInfo?.() ?? [];
      const expansion = (() => {
        try {
          if (typeof globalThis.CityCommandTypes === "undefined") return null;
          return globalThis.Game?.CityCommands?.canStart?.(cityId, globalThis.CityCommandTypes.EXPAND, {}, false);
        } catch {
          return null;
        }
      })();
      return {
        cityId,
        city: probe(() => city ? {
          id: toComponentId(cityId),
          observedCityId: toComponentId(city.id),
          population: city.population ?? null,
          isTown: city.isTown ?? null,
          location: city.location ?? null,
        } : null),
        isReadyToPlacePopulation: probe(() => city?.Growth?.isReadyToPlacePopulation ?? null),
        cityWorkerCap: probe(() => city?.Workers?.getCityWorkerCap?.() ?? null),
        workablePlotIndexes: probe(() => Array.isArray(placementInfo) ? placementInfo.filter((info) => !info?.IsBlocked).map((info) => info?.PlotIndex) : []),
        blockedPlotIndexes: probe(() => Array.isArray(placementInfo) ? placementInfo.filter((info) => info?.IsBlocked).map((info) => info?.PlotIndex) : []),
        expansionPlotIndexes: probe(() => Array.isArray(expansion?.Plots) ? expansion.Plots : []),
      };
    };
    const componentKey = (value) => {
      const id = toComponentId(value);
      return id ? id.owner + ":" + id.id + ":" + (id.type ?? "") : "";
    };
    const notificationValue = (notification, names) => {
      for (const name of names) {
        if (notification && Object.prototype.hasOwnProperty.call(notification, name)) return notification[name];
        const getter = "get" + name;
        if (typeof notification?.[getter] === "function") {
          try {
            return notification[getter]();
          } catch {}
        }
      }
      return null;
    };
    const summarizeBuildQueue = (city, args) => {
      const buildQueue = city?.BuildQueue;
      if (!buildQueue) return null;
      return {
        currentProductionTypeHash: (() => {
          try {
            return typeof buildQueue.getCurrentProductionTypeHash === "function"
              ? buildQueue.getCurrentProductionTypeHash()
              : buildQueue.currentProductionTypeHash ?? buildQueue.productionTypeHash ?? null;
          } catch {
            return buildQueue.currentProductionTypeHash ?? buildQueue.productionTypeHash ?? null;
          }
        })(),
        previousProductionTypeHash: (() => {
          try {
            return typeof buildQueue.getPreviousProductionTypeHash === "function"
              ? buildQueue.getPreviousProductionTypeHash()
              : buildQueue.previousProductionTypeHash ?? null;
          } catch {
            return buildQueue.previousProductionTypeHash ?? null;
          }
        })(),
        productionProgress: (() => {
          try {
            return typeof buildQueue.getProductionProgress === "function"
              ? buildQueue.getProductionProgress()
              : buildQueue.productionProgress ?? buildQueue.progress ?? null;
          } catch {
            return buildQueue.productionProgress ?? buildQueue.progress ?? null;
          }
        })(),
        turnsLeftForRequestedItem: (() => {
          try {
            const requestedType = args?.UnitType ?? args?.ConstructibleType ?? args?.ProjectType ?? null;
            return requestedType == null || typeof buildQueue.getTurnsLeft !== "function"
              ? null
              : buildQueue.getTurnsLeft(requestedType);
          } catch {
            return null;
          }
        })(),
        queueLength: (() => {
          try {
            return typeof buildQueue.getQueue === "function" ? buildQueue.getQueue()?.length ?? null : null;
          } catch {
            return null;
          }
        })(),
      };
    };
    const productionPostconditionEligible = (family, input) => family === "city-operation" && input.operationType === "BUILD";
    const readProductionPostconditionSnapshot = (input) => {
      const cityId = toComponentId(input.cityId);
      const city = cityId ? globalThis.Cities?.get?.(cityId) : null;
      return {
        cityId,
        city: probe(() => city ? {
          id: toComponentId(cityId),
          observedCityId: toComponentId(city.id),
          population: city.population ?? null,
          isTown: city.isTown ?? null,
          location: city.location ?? null,
        } : null),
        buildQueue: probe(() => summarizeBuildQueue(city, input.args ?? null)),
        selectedCityId: probe(() => toComponentId(globalThis.UI?.Player?.getHeadSelectedCity?.())),
        blocker: probe(() => globalThis.Game?.Notifications?.getEndTurnBlockingType?.(globalThis.GameContext?.localPlayerID)),
        canEndTurn: probe(() => globalThis.Game?.TurnManager?.canEndTurn?.() ?? null),
        blockingProductionNotification: probe(() => {
          const notifications = globalThis.Game?.Notifications;
          const localPlayerId = globalThis.GameContext?.localPlayerID;
          if (!notifications || localPlayerId == null) return null;
          const blockerType = typeof notifications.getEndTurnBlockingType === "function"
            ? notifications.getEndTurnBlockingType(localPlayerId)
            : null;
          const blockerId = typeof notifications.findEndTurnBlocking === "function"
            ? notifications.findEndTurnBlocking(localPlayerId, blockerType)
            : null;
          const id = toComponentId(blockerId);
          if (!id) return null;
          const notification = typeof notifications.find === "function" ? notifications.find(id) : null;
          const type = typeof notifications.getType === "function" ? notifications.getType(id) : notificationValue(notification, ["Type", "type"]);
          const typeName = typeof notifications.getTypeName === "function" ? notifications.getTypeName(type) : null;
          const target = notificationValue(notification, ["Target", "target"]);
          if (!String(typeName ?? "").includes("CHOOSE_CITY_PRODUCTION")) return null;
          return {
            id,
            type,
            typeName,
            target,
            matchesCity: cityId ? componentKey(target) === componentKey(cityId) : null,
            canUserDismiss: notificationValue(notification, ["CanUserDismiss", "canUserDismiss"]),
            expired: notificationValue(notification, ["Expired", "expired"]),
            dismissed: notificationValue(notification, ["Dismissed", "dismissed"]),
          };
        }),
      };
    };
    const routerFor = (family) => {
      if (family === "unit-operation") return { router: Game.UnitOperations, enums: UnitOperationTypes, targetKey: "unitId" };
      if (family === "unit-command") return { router: Game.UnitCommands, enums: UnitCommandTypes, targetKey: "unitId" };
      if (family === "city-operation") return { router: Game.CityOperations, enums: CityOperationTypes, targetKey: "cityId" };
      if (family === "city-command") return { router: Game.CityCommands, enums: CityCommandTypes, targetKey: "cityId" };
      if (family === "player-operation") return { router: Game.PlayerOperations, enums: PlayerOperationTypes, targetKey: "playerId" };
      throw new Error("Unsupported operation family " + family);
    };
    const enumValueFor = (enums, operationType) => {
      if (enums && Object.prototype.hasOwnProperty.call(enums, operationType)) return enums[operationType];
      if (enums && typeof operationType === "string") {
        const normalizedKeys = [
          operationType.replace(/^UNITOPERATION_/, ""),
          operationType.replace(/^UNITCOMMAND_/, ""),
          operationType.replace(/^CITYOPERATION_/, ""),
          operationType.replace(/^CITYCOMMAND_/, ""),
          operationType.replace(/^PLAYEROPERATION_/, ""),
        ];
        for (const key of normalizedKeys) {
          if (Object.prototype.hasOwnProperty.call(enums, key)) return enums[key];
        }
      }
      return operationType;
    };
    const callCanStart = (router, target, enumValue, args) => {
      const attempts = [
        () => router.canStart(target, enumValue, args ?? {}, false),
        () => router.canStart(target, enumValue, args ?? {}),
        () => router.canStart(target, enumValue),
      ];
      let last;
      for (const attempt of attempts) {
        try {
          return attempt();
        } catch (err) {
          last = err;
        }
      }
      throw last;
    };
    const successFromCanStart = (result) => {
      if (result === true) return true;
      if (result === false || result == null) return false;
      if (typeof result === "object") {
        if (result.Success !== undefined) return result.Success === true;
        if (result.success !== undefined) return result.success === true;
        if (result.canStart !== undefined) return result.canStart === true;
      }
      return Boolean(result);
    };
    const validateOperation = (family, input) => {
      const meta = routerFor(family);
      const enumValue = enumValueFor(meta.enums, input.operationType);
      const target = input[meta.targetKey];
      const result = callCanStart(meta.router, target, enumValue, input.args);
      return {
        family,
        operationType: input.operationType,
        enumValue,
        target: { [meta.targetKey]: target },
        args: input.args,
        valid: successFromCanStart(result),
        result,
      };
    };
    const sendOperation = (family, input) => {
      const beforePostcondition = unitPostconditionEligible(family) ? readUnitPostconditionSnapshot(input) : undefined;
      const populationCityId = populationPostconditionCityId(family, input);
      const beforePopulationPostcondition = populationCityId ? readPopulationPlacementPostconditionSnapshot(populationCityId) : undefined;
      const beforeProductionPostcondition = productionPostconditionEligible(family, input) ? readProductionPostconditionSnapshot(input) : undefined;
      const before = validateOperation(family, input);
      if (!before.valid) return {
        sent: false,
        before,
        result: null,
        beforePostcondition,
        afterPostcondition: beforePostcondition,
        beforePopulationPostcondition,
        afterPopulationPostcondition: beforePopulationPostcondition,
        beforeProductionPostcondition,
        afterProductionPostcondition: beforeProductionPostcondition,
      };
      const meta = routerFor(family);
      const target = input[meta.targetKey];
      const result = meta.router.sendRequest(target, before.enumValue, input.args ?? {});
      const afterPostcondition = unitPostconditionEligible(family) ? readUnitPostconditionSnapshot(input) : undefined;
      const afterPopulationPostcondition = populationCityId ? readPopulationPlacementPostconditionSnapshot(populationCityId) : undefined;
      const afterProductionPostcondition = productionPostconditionEligible(family, input) ? readProductionPostconditionSnapshot(input) : undefined;
      return { sent: true, before, result, beforePostcondition, afterPostcondition, beforePopulationPostcondition, afterPopulationPostcondition, beforeProductionPostcondition, afterProductionPostcondition };
    };`;
}
