/**
 * Supplies the official action-panel component lookup and native can-end-turn probe.
 *
 * Consumers must include `probeHelperSource()` before this source.
 */
export function actionPanelTurnAuthoritySource(): string {
  return `const requireActionPanelComponent = () => {
      if (typeof document === "undefined" || typeof document.querySelector !== "function") {
        throw new Error("document.querySelector is unavailable.");
      }
      const component = document.querySelector(".action-panel")?.maybeComponent;
      if (!component) {
        throw new Error("The .action-panel component is unavailable.");
      }
      return component;
    };
    const readActionPanelCanEndTurn = () => probe(() => {
      const component = requireActionPanelComponent();
      if (typeof component.canEndTurn !== "function") {
        throw new Error("The .action-panel component canEndTurn method is unavailable.");
      }
      const value = component.canEndTurn();
      if (typeof value !== "boolean") {
        throw new Error("The .action-panel component canEndTurn method returned a non-boolean value.");
      }
      return value;
    });`;
}
