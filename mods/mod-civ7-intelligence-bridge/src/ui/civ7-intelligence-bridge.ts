import {
  type Civ7GameUiRuntimeTarget,
  installCiv7GameUiIntelligenceBridge,
} from "@civ7/control-orpc/game-ui";

installCiv7GameUiIntelligenceBridge({
  target: globalThis as unknown as Civ7GameUiRuntimeTarget,
});
