import { probeHelperSource } from "../../runtime/probe";

export function notificationDismissalSource(): string {
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
    const safeNotificationValue = (notification, key) => {
      try {
        const value = notification == null ? undefined : notification[key];
        if (typeof value === "function") return value.call(notification);
        return value === undefined ? null : value;
      } catch (err) {
        return { error: String(err) };
      }
    };
    const notificationTrainModel = () => typeof NotificationModel !== "undefined"
      ? NotificationModel
      : globalThis.NotificationModel;
    const notificationTrainManager = () => notificationTrainModel()?.manager ?? null;
    const notificationTrainQueueIds = () => {
      const model = notificationTrainModel();
      const manager = model?.manager;
      const playerEntry = manager?.findPlayer?.(GameContext.localPlayerID);
      if (!playerEntry || typeof playerEntry.getTypesBy !== "function") return [];
      const queryBy = model?.QueryBy?.Priority ?? 2;
      const entries = playerEntry.getTypesBy(queryBy, true) ?? [];
      const ids = [];
      for (const entry of entries) {
        const notifications = entry?.notifications ?? [];
        for (const id of notifications) {
          const normalized = toComponentId(id);
          if (normalized) ids.push(normalized);
        }
      }
      return ids;
    };
    const summarize = (id) => {
      const normalizedId = toComponentId(id);
      const notification = normalizedId ? Game.Notifications.find(normalizedId) : null;
      const type = (() => {
        try {
          return typeof Game.Notifications.getType === "function"
            ? Game.Notifications.getType(normalizedId)
            : notification?.Type ?? null;
        } catch {
          return notification?.Type ?? null;
        }
      })();
      const typeName = (() => {
        try {
          return typeof Game.Notifications.getTypeName === "function"
            ? Game.Notifications.getTypeName(type)
            : null;
        } catch {
          return null;
        }
      })();
      const endTurnBlockingType = probe(() => Game.Notifications.getEndTurnBlockingType(GameContext.localPlayerID));
      const isEndTurnBlocking = probe(() => {
        const blockerType = endTurnBlockingType.ok ? endTurnBlockingType.value : Game.Notifications.getEndTurnBlockingType(GameContext.localPlayerID);
        const blockerId = Game.Notifications.findEndTurnBlocking(GameContext.localPlayerID, blockerType);
        return componentKey(blockerId) === componentKey(normalizedId);
      });
      const engineQueueIds = probe(() => {
        if (typeof Game.Notifications.getIdsForPlayer !== "function") return [];
        const ids = Game.Notifications.getIdsForPlayer(GameContext.localPlayerID);
        return Array.isArray(ids) ? ids.map((value) => toComponentId(value)).filter(Boolean) : [];
      });
      const engineIds = engineQueueIds.ok ? engineQueueIds.value : [];
      const engineQueueFirstId = probe(() => engineIds.length > 0 ? engineIds[0] : null);
      const engineQueueContains = probe(() => engineIds.some((value) => componentKey(value) === componentKey(normalizedId)));
      const isEngineQueueFront = probe(() => componentKey(engineQueueFirstId.ok ? engineQueueFirstId.value : null) === componentKey(normalizedId));
      const trainQueueIds = probe(() => notificationTrainQueueIds());
      const trainIds = trainQueueIds.ok ? trainQueueIds.value : [];
      const notificationTrainFirstId = probe(() => trainIds.length > 0 ? trainIds[0] : null);
      const notificationTrainContains = probe(() => trainIds.some((value) => componentKey(value) === componentKey(normalizedId)));
      const isNotificationTrainFront = probe(() => componentKey(notificationTrainFirstId.ok ? notificationTrainFirstId.value : null) === componentKey(normalizedId));
      return {
        id: normalizedId,
        exists: notification != null,
        type,
        typeName,
        summary: (() => {
          try {
            return typeof Game.Notifications.getSummary === "function"
              ? Game.Notifications.getSummary(normalizedId) ?? null
              : safeNotificationValue(notification, "Summary");
          } catch {
            return safeNotificationValue(notification, "Summary");
          }
        })(),
        message: (() => {
          try {
            return typeof Game.Notifications.getMessage === "function"
              ? Game.Notifications.getMessage(normalizedId) ?? null
              : safeNotificationValue(notification, "Message");
          } catch {
            return safeNotificationValue(notification, "Message");
          }
        })(),
        target: safeNotificationValue(notification, "Target"),
        location: safeNotificationValue(notification, "Location"),
        canUserDismiss: safeNotificationValue(notification, "CanUserDismiss"),
        expired: safeNotificationValue(notification, "Expired"),
        dismissed: safeNotificationValue(notification, "Dismissed"),
        blocksTurnAdvancement: probe(() => typeof Game.Notifications.getBlocksTurnAdvancement === "function"
          ? Game.Notifications.getBlocksTurnAdvancement(normalizedId)
          : safeNotificationValue(notification, "BlocksTurnAdvancement")),
        endTurnBlockingType,
        isEndTurnBlocking,
        engineQueueCount: probe(() => engineIds.length),
        engineQueueContains,
        engineQueueFirstId,
        isEngineQueueFront,
        notificationTrainCount: probe(() => trainIds.length),
        notificationTrainContains,
        notificationTrainFirstId,
        isNotificationTrainFront,
      };
    };
    const verifiedDismissed = (before, after) => {
      if (after == null) return false;
      if (after.exists === false) return true;
      const engineStillFront = after.isEngineQueueFront?.ok === true && after.isEngineQueueFront.value === true;
      if (engineStillFront) return false;
      if (after.dismissed === true) return true;
      const wasInEngineQueue = before?.engineQueueContains?.ok === true && before.engineQueueContains.value === true;
      if (wasInEngineQueue && after.engineQueueContains?.ok === true && after.engineQueueContains.value === false) return true;
      const wasInTrain = before?.notificationTrainContains?.ok === true && before.notificationTrainContains.value === true;
      if (wasInTrain && after.notificationTrainContains?.ok === true && after.notificationTrainContains.value === false) return true;
      const wasEngineFront = before?.isEngineQueueFront?.ok === true && before.isEngineQueueFront.value === true;
      if (wasEngineFront && after.isEngineQueueFront?.ok === true && after.isEngineQueueFront.value === false) return true;
      const wasTrainFront = before?.isNotificationTrainFront?.ok === true && before.isNotificationTrainFront.value === true;
      if (wasTrainFront && after.isNotificationTrainFront?.ok === true && after.isNotificationTrainFront.value === false) return true;
      return false;
    };
    const notificationTrainManagerDismiss = (notificationId) => {
      const manager = notificationTrainManager();
      if (!manager) return { ok: false, attempted: false, available: false, reason: "NotificationModel.manager unavailable in this App UI eval scope" };
      if (typeof manager.dismiss === "function") {
        try {
          const value = manager.dismiss(notificationId);
          return { ok: true, attempted: true, available: true, path: "NotificationModel.manager.dismiss", value };
        } catch (err) {
          return { ok: false, attempted: true, available: true, path: "NotificationModel.manager.dismiss", error: String(err) };
        }
      }
      if (typeof manager.onDismiss === "function") {
        try {
          const value = manager.onDismiss(notificationId);
          return { ok: true, attempted: true, available: true, path: "NotificationModel.manager.onDismiss", value };
        } catch (err) {
          return { ok: false, attempted: true, available: true, path: "NotificationModel.manager.onDismiss", error: String(err) };
        }
      }
      return { ok: false, attempted: false, available: false, reason: "NotificationModel.manager exposes no dismiss/onDismiss function" };
    };
    const panelCloseControlDismiss = (notificationId, before) => {
      if (typeof Game.Notifications.dismiss !== "function") {
        return { ok: false, attempted: false, available: false, reason: "Game.Notifications.dismiss unavailable in this App UI eval scope" };
      }
      const noneBlocker = globalThis.EndTurnBlockingTypes?.NONE ?? 0;
      const blockingType = before?.endTurnBlockingType?.ok === true ? before.endTurnBlockingType.value : null;
      if (blockingType != null && blockingType !== noneBlocker && before?.isEndTurnBlocking?.ok === true && before.isEndTurnBlocking.value === true) {
        return { ok: false, attempted: false, available: false, path: "Game.Notifications.dismiss", reason: "official panel close control does not dismiss the active end-turn blocker" };
      }
      try {
        return { ok: true, attempted: true, available: true, path: "Game.Notifications.dismiss", value: Game.Notifications.dismiss(notificationId) };
      } catch (err) {
        return { ok: false, attempted: true, available: true, path: "Game.Notifications.dismiss", error: String(err) };
      }
    };
    const waitForDismissalVerification = (notificationId, before, attempts) => {
      const out = [];
      for (let index = 0; index < attempts; index += 1) {
        const current = summarize(notificationId);
        out.push(current);
        if (verifiedDismissed(before, current)) break;
        const waitUntil = Date.now() + 25;
        while (Date.now() < waitUntil) {}
      }
      return out;
    };
    const readNotificationDismissal = (input, options) => {
      const notificationId = input.notificationId;
      const before = summarize(notificationId);
      const noneBlocker = globalThis.EndTurnBlockingTypes?.NONE ?? 0;
      const blockerType = before.endTurnBlockingType?.ok === true ? before.endTurnBlockingType.value : null;
      const canUseExpiredPanelCloseControl = before.exists === true
        && before.expired === true
        && blockerType === noneBlocker;
      const canDismiss = before.exists === true && (before.canUserDismiss === true || canUseExpiredPanelCloseControl);
      const notes = [
        "This is an App UI notification action, not a gameplay operation family.",
        "Use it only for reviewed notifications whose official handler does not require a specialized operation.",
        "Send mode records both official actor routes: notification-train manager dismissal and the visible panel close-control dismissal when that route is available for this item.",
        "Expired front notifications may use the desktop panel close-control route when Civ reports no typed end-turn blocker; success still requires identity-based disappearance or queue/front movement.",
        "Verification is identity-based: disappeared, dismissed, removed from the engine queue or notification train, or moved off a front position it occupied before send. Non-blocking status alone is not proof.",
        "The embedded App UI action records immediate route evidence. The direct-control wrapper performs final verification across separate App UI reads so frame-driven queues can advance."
      ];
      if (options.send !== true) {
        return {
          notificationId,
          before,
          after: null,
          canDismiss,
          sent: false,
          result: null,
          closeoutPath: null,
          verificationAttempts: [],
          verified: false,
          notes,
        };
      }
      if (!canDismiss) {
        return {
          notificationId,
          before,
          after: before,
          canDismiss,
          sent: false,
          result: null,
          closeoutPath: null,
          verificationAttempts: [before],
          verified: false,
          notes: notes.concat(["Notification was not dismissed because canUserDismiss was not true."]),
        };
      }
      const managerResult = notificationTrainManagerDismiss(notificationId);
      const panelCloseControlResult = panelCloseControlDismiss(notificationId, before);
      const verificationAttempts = waitForDismissalVerification(notificationId, before, options.verificationAttempts ?? 3);
      const after = verificationAttempts[verificationAttempts.length - 1] ?? summarize(notificationId);
      const result = {
        notificationTrainManager: managerResult,
        panelCloseControl: panelCloseControlResult,
      };
      const closeoutPath = [managerResult, panelCloseControlResult]
        .filter((value) => value?.attempted && value?.path)
        .map((value) => value.path)
        .join("+") || null;
      return {
        notificationId,
        before,
        after,
        canDismiss,
        sent: true,
        closeoutPath,
        result,
        verificationAttempts,
        verified: verifiedDismissed(before, after),
        notes,
      };
    };`;
}
