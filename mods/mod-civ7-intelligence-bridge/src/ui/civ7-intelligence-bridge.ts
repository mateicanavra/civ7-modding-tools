import {
  type Civ7GameUiRuntimeTarget,
  installCiv7GameUiIntelligenceBridge,
} from "../controller/game-ui";

installCiv7GameUiIntelligenceBridge({
  target: globalThis as unknown as Civ7GameUiRuntimeTarget,
});
