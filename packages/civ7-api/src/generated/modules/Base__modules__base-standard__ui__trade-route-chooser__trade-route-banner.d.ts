/**
 * @file trade-route-banner.ts
 * @copyright 2025, Firaxis Games
 * @description Select and get info on trade trade routes
 */
import { IProjectedTradeRoute } from "/base-standard/ui/trade-route-chooser/trade-routes-model.js";
export declare class TradeRouteBanner extends Component {
    private _worldAnchorHandle;
    private _routeInfo?;
    set routeInfo(value: IProjectedTradeRoute | undefined);
    get routeInfo(): IProjectedTradeRoute | undefined;
    constructor(root: ComponentRoot);
    onAttach(): void;
    onDetach(): void;
    private makeWorldAnchor;
    private destroyWorldAnchor;
}
declare global {
    interface HTMLElementTagNameMap {
        "trade-route-banner": ComponentRoot<TradeRouteBanner>;
    }
}
