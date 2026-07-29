import { probeHelperSource } from "../../runtime/probe";

export function traditionsViewSource(): string {
  return `${probeHelperSource()}
    const loc = (key) => {
      if (key == null || key === "") return null;
      try {
        return typeof Locale !== "undefined" && Locale.compose ? Locale.compose(key) : String(key);
      } catch {
        return String(key);
      }
    };
    const uniqueNumbers = (values) => Array.from(new Set((Array.isArray(values) ? values : []).filter((value) => Number.isFinite(value))));
    const readActiveTraditionIds = (culture) => {
      if (typeof culture.getActiveTraditions !== "function") {
        throw new Error("Culture.getActiveTraditions is unavailable.");
      }
      const cultureSlotTypes =
        typeof CultureSlotTypes !== "undefined" ? CultureSlotTypes : null;
      const slots = [
        ["POLICY_CULTURE_SLOT", cultureSlotTypes?.POLICY_CULTURE_SLOT],
        ["TRADITION_CULTURE_SLOT", cultureSlotTypes?.TRADITION_CULTURE_SLOT],
        ["CRISIS_CULTURE_SLOT", cultureSlotTypes?.CRISIS_CULTURE_SLOT],
      ];
      if (slots.some(([, slotType]) => slotType === undefined || slotType === null)) {
        throw new Error(
          "CultureSlotTypes policy, tradition, and crisis slot constants are required."
        );
      }
      const activeTraditions = new Set();
      for (const [slotName, slotType] of slots) {
        const values = culture.getActiveTraditions(slotType);
        if (
          values === null ||
          values === undefined ||
          typeof values[Symbol.iterator] !== "function"
        ) {
          throw new Error(
            "Culture.getActiveTraditions returned a non-iterable value for " + slotName + "."
          );
        }
        for (const traditionId of values) {
          if (!Number.isInteger(traditionId)) {
            throw new Error(
              "Culture.getActiveTraditions returned a non-integer value for " + slotName + "."
            );
          }
          activeTraditions.add(traditionId);
        }
      }
      return Array.from(activeTraditions).sort((left, right) => left - right);
    };
    const readTraditionsView = (input) => {
      const playerId = input.playerId ?? GameContext.localPlayerID;
      const player = Players.get(playerId);
      if (!player || !player.Culture) {
        throw new Error("Player culture is unavailable for player " + playerId);
      }
      const culture = player.Culture;
      const activeIds = readActiveTraditionIds(culture);
      const unlockedIds = uniqueNumbers(probe(() => culture.getUnlockedTraditions()).value ?? []);
      const allUnlockedIds = uniqueNumbers(probe(() => culture.getAllUnlockedTraditions()).value ?? unlockedIds);
      const recentIds = uniqueNumbers(probe(() => culture.getRecentUnlockedTraditions()).value ?? probe(() => culture.getAllRecentUnlockedTraditions()).value ?? []);
      const ids = uniqueNumbers([...allUnlockedIds, ...unlockedIds, ...activeIds, ...recentIds]);
      const activate = typeof PlayerOperationParameters !== "undefined" ? PlayerOperationParameters.Activate : null;
      const deactivate = typeof PlayerOperationParameters !== "undefined" ? PlayerOperationParameters.Deactivate : null;
      const actionHint = (traditionId, kind, action) => {
        const args = { TraditionType: traditionId, Action: action };
        const validation = action == null
          ? { ok: false, error: "PlayerOperationParameters." + (kind === "activate" ? "Activate" : "Deactivate") + " is unavailable" }
          : probe(() => Game.PlayerOperations.canStart(playerId, PlayerOperationTypes.CHANGE_TRADITION, args, false));
        return {
          kind,
          action,
          operationType: "CHANGE_TRADITION",
          args,
          validation,
        };
      };
      const summarize = (id) => {
        const definition = probe(() => GameInfo.Traditions.lookup(id)).value ?? null;
        const active = activeIds.includes(id);
        const unlocked = allUnlockedIds.includes(id) || unlockedIds.includes(id) || probe(() => culture.isTraditionUnlocked(id)).value === true;
        const recentUnlock = recentIds.includes(id);
        const actionHints = active
          ? [actionHint(id, "deactivate", deactivate)]
          : [actionHint(id, "activate", activate)];
        return {
          id,
          type: definition?.TraditionType ?? null,
          name: loc(definition?.Name ?? definition?.TraditionType ?? null),
          description: loc(definition?.Description ?? null),
          ageType: definition?.AgeType ?? null,
          cultureSlotType: definition?.CultureSlotType ?? null,
          traitType: definition?.TraitType ?? null,
          isCrisis: definition?.IsCrisis === true,
          active,
          unlocked,
          recentUnlock,
          actionHints,
        };
      };
      const traditions = ids.map(summarize);
      const active = traditions
        .filter((tradition) => tradition.active)
        .sort((left, right) => left.id - right.id);
      const available = traditions.filter((tradition) => tradition.unlocked && !tradition.active);
      const recentUnlocks = traditions.filter((tradition) => tradition.recentUnlock);
      const totalSlots = probe(() => culture.getNumAllCultureSlots ? culture.getNumAllCultureSlots() : culture.numTraditionSlots ?? culture.getNumCultureSlots());
      const normalSlots = probe(() => culture.numNormalTraditionSlots ?? culture.getNumCultureSlots());
      const crisisSlots = probe(() => culture.numCrisisTraditionSlots ?? 0);
      const governmentType = probe(() => culture.getGovernmentType());
      const governmentDefinition = governmentType.ok ? probe(() => GameInfo.Governments.lookup(governmentType.value)).value ?? null : null;
      return {
        playerId,
        turn: probe(() => Game.turn),
        turnDate: probe(() => Game.getTurnDate()),
        governmentType,
        government: {
          type: governmentDefinition?.GovernmentType ?? null,
          name: loc(governmentDefinition?.Name ?? governmentDefinition?.GovernmentType ?? null),
        },
        slots: {
          total: totalSlots,
          normal: normalSlots,
          crisis: crisisSlots,
          active: active.length,
          unlocked: allUnlockedIds.length,
          available: available.length,
          open: Math.max(0, (totalSlots.ok && Number.isFinite(totalSlots.value) ? totalSlots.value : active.length) - active.length),
        },
        actions: { activate, deactivate },
        active,
        available,
        recentUnlocks,
        traditions,
        hiddenInfoPolicy: "player-culture-runtime",
        notes: [
          "Read-only traditions view; it does not send CHANGE_TRADITION or CONSIDER_ASSIGN_TRADITIONS.",
          "Use the exact TraditionType and Action values from actionHints, then validate the selected change.",
          "Full slots may require deactivating an existing tradition before activating a new one; re-read this view after each mutation.",
        ],
      };
    };`;
}
