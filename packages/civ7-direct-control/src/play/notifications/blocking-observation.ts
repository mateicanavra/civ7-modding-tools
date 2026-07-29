/**
 * Supplies the shared App UI wire helpers for one paired end-turn-blocker read.
 *
 * Consumers must include `probeHelperSource()` before this source.
 */
export function blockingNotificationObservationSource(): string {
  return `const readNumericField = (value, lowerKey, upperKey) => {
      if (!value || typeof value !== "object") return null;
      const lower = value[lowerKey];
      if (typeof lower === "number" && Number.isFinite(lower)) return lower;
      const upper = value[upperKey];
      return typeof upper === "number" && Number.isFinite(upper) ? upper : null;
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
    const notificationType = (value) =>
      typeof value === "string" || Number.isInteger(value) ? value : null;
    const endTurnBlockerType = (value) => {
      if (value === 0) return 0;
      if (Number.isInteger(value)) return value;
      if (
        typeof value === "string" &&
        value.trim().length > 0 &&
        value.trim() !== "0"
      ) {
        return value;
      }
      throw new Error(
        "Game.Notifications.getEndTurnBlockingType returned an unsupported blocker identity."
      );
    };
    const nullableString = (value) => typeof value === "string" ? value : null;
    const notificationValue = (notification, names) => {
      for (const name of names) {
        try {
          if (
            notification &&
            (typeof notification === "object" || typeof notification === "function") &&
            name in notification
          ) {
            const value = notification[name];
            return typeof value === "function" ? value.call(notification) : value;
          }
          const getter = "get" + name;
          if (typeof notification?.[getter] === "function") return notification[getter]();
        } catch {}
      }
      return null;
    };
    const readBlockingNotificationEvidence = (localPlayerId) => {
      const blocker = probe(() => {
        const notifications = globalThis.Game?.Notifications;
        if (typeof notifications?.getEndTurnBlockingType !== "function") {
          throw new Error("Game.Notifications.getEndTurnBlockingType is unavailable.");
        }
        return endTurnBlockerType(notifications.getEndTurnBlockingType(localPlayerId));
      });
      if (!blocker.ok) {
        return {
          blocker,
          blockingNotification: {
            ok: false,
            error: "Blocking notification is unavailable because the blocker read failed.",
          },
        };
      }
      return {
        blocker,
        blockingNotification: probe(() => {
          const notifications = globalThis.Game?.Notifications;
          if (typeof notifications.findEndTurnBlocking !== "function") {
            throw new Error("Game.Notifications.findEndTurnBlocking is unavailable.");
          }
          const blockerId = notifications.findEndTurnBlocking(localPlayerId, blocker.value);
          if (blockerId == null) return null;
          const id = toComponentId(blockerId);
          if (!id) {
            throw new Error("Game.Notifications.findEndTurnBlocking returned an invalid ComponentID.");
          }
          const notification =
            typeof notifications.find === "function" ? notifications.find(blockerId) : null;
          const type = notificationType(
            typeof notifications.getType === "function"
              ? notifications.getType(blockerId)
              : notificationValue(notification, ["Type", "type"])
          );
          const typeName = nullableString(
            typeof notifications.getTypeName === "function"
              ? notifications.getTypeName(type)
              : notificationValue(notification, ["TypeName", "typeName"])
          );
          return {
            id,
            type,
            typeName,
            target: toComponentId(notificationValue(notification, ["Target", "target"])),
          };
        }),
      };
    };`;
}
