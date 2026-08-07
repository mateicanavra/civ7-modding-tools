import { DisplayHandlerBase } from "/core/ui/context-manager/display-handler.js";
import { DisplayHideOptions, IDisplayRequestBase } from "/core/ui/context-manager/display-queue-manager.js";
import { VictoryAchievedScreenCategory, VictoryRequest } from "/base-standard/ui/victory-progress/model-victory-progress.js";
declare class VictoryAchievedScreenManager extends DisplayHandlerBase<VictoryRequest> {
    VictoryAchievedScreenElement: HTMLElement | null;
    constructor();
    show(_request: VictoryRequest): void;
    hide(_request: IDisplayRequestBase, _options: DisplayHideOptions): void;
}
declare const VictoryAchievedScreenManagerInstance: VictoryAchievedScreenManager;
export { VictoryAchievedScreenCategory, VictoryAchievedScreenManagerInstance as default };
