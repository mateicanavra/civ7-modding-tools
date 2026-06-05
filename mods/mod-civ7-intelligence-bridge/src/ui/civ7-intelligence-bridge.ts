import {
  installCiv7GameUiIntelligenceBridge,
  type Civ7GameUiRuntimeTarget,
} from "@civ7/control-orpc/game-ui";

installCiv7GameUiIntelligenceBridge({
  target: globalThis as unknown as Civ7GameUiRuntimeTarget,
});
