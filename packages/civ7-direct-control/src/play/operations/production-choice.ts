function probeHelperSource(): string {
  return `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;
}

export function productionChoiceRequestSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
      return out;
    };
    const componentKey = (value) => {
      const id = toComponentId(value);
      return id ? [id.owner, id.id, id.type ?? ""].join(":") : "";
    };
    const notificationValue = (notification, keys) => {
      for (const key of keys) {
        try {
          const value = notification == null ? undefined : notification[key];
          if (typeof value === "function") return value.call(notification);
          if (value !== undefined) return value;
        } catch {}
      }
      return null;
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
    const summarizeBuildQueue = (city, args) => {
      const buildQueue = city?.BuildQueue ?? city?.buildQueue ?? city?.buildQueueManager ?? null;
      if (!buildQueue) return null;
      return {
        currentProductionTypeHash: buildQueue.currentProductionTypeHash ?? buildQueue.currentProductionType ?? null,
        previousProductionTypeHash: buildQueue.previousProductionTypeHash ?? buildQueue.previousProductionType ?? null,
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
    const activateProductionCity = (cityId) => probe(() => {
      globalThis.UI?.Player?.lookAtID?.(cityId);
      globalThis.UI?.Player?.selectCity?.(cityId);
      const cityLocation = globalThis.Cities?.get?.(cityId)?.location;
      if (cityLocation && globalThis.PlotCursor) {
        globalThis.PlotCursor.plotCursorCoords = cityLocation;
      }
      return { selectedCityId: toComponentId(globalThis.UI?.Player?.getHeadSelectedCity?.()) };
    });
    const closeProductionUi = () => probe(() => {
      globalThis.UI?.Player?.deselectAllCities?.();
      globalThis.InterfaceMode?.switchToDefault?.();
      return {
        selectedCityId: toComponentId(globalThis.UI?.Player?.getHeadSelectedCity?.()),
        interfaceMode: globalThis.InterfaceMode?.getCurrentMode?.() ?? null,
      };
    });
    const readProductionChoice = (input, options) => {
      const cityId = toComponentId(input.cityId);
      if (!cityId) throw new Error("Production choice cityId must be a ComponentID.");
      const itemKeys = ["UnitType", "ConstructibleType", "ProjectType"].filter((key) => Number.isInteger(input.args?.[key]));
      if (itemKeys.length !== 1) throw new Error("Production choice requires exactly one UnitType, ConstructibleType, or ProjectType.");
      const args = { ...input.args };
      const beforeProductionPostcondition = readProductionPostconditionSnapshot({ cityId, args });
      const city = globalThis.Cities?.get?.(cityId) ?? null;
      const cityActivation = options.send ? activateProductionCity(cityId) : { ok: false, skipped: true, reason: "read-only production choice status" };
      const beforeValidation = probe(() => globalThis.Game.CityOperations.canStart(cityId, globalThis.CityOperationTypes.BUILD, args, false));
      let sent = false;
      let sendResult = { ok: false, skipped: true, reason: "send not requested" };
      let interfaceClose = { ok: false, skipped: true, reason: "send not requested" };
      if (options.send && successFromCanStart(beforeValidation.value)) {
        const result = beforeValidation.value;
        if (result && typeof result === "object" && result.InProgress && Array.isArray(result.Plots) && result.Plots.length > 0 && args.X == null && args.Y == null) {
          const loc = globalThis.GameplayMap?.getLocationFromIndex?.(result.Plots[0]);
          if (loc) {
            args.X = loc.x;
            args.Y = loc.y;
          }
        }
        if (Number.isInteger(args.ProjectType) && city?.isTown && globalThis.CityOperationsParametersValues?.Exclusive !== undefined) {
          args.InsertMode = globalThis.CityOperationsParametersValues.Exclusive;
        }
        sendResult = probe(() => globalThis.Game.CityOperations.sendRequest(cityId, globalThis.CityOperationTypes.BUILD, args));
        sent = sendResult.ok === true && sendResult.value !== false;
        interfaceClose = sent ? closeProductionUi() : { ok: false, skipped: true, reason: "sendRequest did not report success" };
      }
      const afterValidation = probe(() => globalThis.Game.CityOperations.canStart(cityId, globalThis.CityOperationTypes.BUILD, args, false));
      const afterProductionPostcondition = readProductionPostconditionSnapshot({ cityId, args });
      return {
        cityId,
        args,
        beforeValidation,
        afterValidation,
        sent,
        sendResult,
        beforeProductionPostcondition,
        afterProductionPostcondition,
        ui: { cityActivation, interfaceClose },
        notes: [
          "This mirrors the official production chooser path: activate the target city, validate BUILD, send Game.CityOperations.BUILD, then clear selected-city/interface state after a successful production choice.",
        ],
      };
    };`;
}
