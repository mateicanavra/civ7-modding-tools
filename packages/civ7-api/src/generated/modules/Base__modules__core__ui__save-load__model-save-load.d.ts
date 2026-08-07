/**
 * @file model-save-load.ts
 * @copyright 2021-2024, Firaxis Games
 * @description data for the save/load menu shared script
 */
export interface SaveGameInfo extends FileQueryEntry {
    saveTimeDayName: string;
    saveTimeHourName: string;
    saveActionName: string;
    leaderIconUrl: string;
    civIconUrl: string;
    civForegroundColor: string;
    civBackgroundColor: string;
    gameName: string;
    requiredModsString: string;
    missingMods: string[];
    unownedMods: string[];
    isCurrentGame: boolean;
    isLiveEventGame: boolean;
}
export declare const DEFAULT_SAVE_GAME_INFO: SaveGameInfo;
type SaveLoadModelPartial = {
    [P in keyof SaveLoadModel]?: SaveLoadModel[P];
};
export declare const LoadCompleteEventName: "model-save-load-load-complete";
export declare class LoadCompleteEvent extends CustomEvent<LoadSaveResultData> {
    constructor(detail: LoadSaveResultData);
}
export declare const SaveDoneEventName: "model-save-load-save-done";
export declare class SaveDoneEvent extends CustomEvent<LoadSaveResultData> {
    constructor(detail: LoadSaveResultData);
}
export declare const QueryDoneEventName: "model-save-load-query-done";
export declare class QueryDoneEvent extends CustomEvent<{
    queryId: number;
    fileList: FileQueryEntry[];
}> {
    constructor(detail: {
        queryId: number;
        fileList: FileQueryEntry[];
    });
}
export declare const SyncDoneEventName: "model-save-load-sync-done";
export declare class SyncDoneEvent extends CustomEvent<SyncDoneData> {
    constructor(detail: SyncDoneData);
}
export declare const ResolveConflictDoneEventName: "model-save-load-resolve-conflict-done";
export declare class ResolveConflictDoneEvent extends CustomEvent<ConflictResolveData> {
    constructor(detail: ConflictResolveData);
}
export declare const DeleteDoneEventName: "model-save-load-delete-done";
export declare class DeleteDoneEvent extends CustomEvent<LoadSaveResultData> {
    constructor(detail: LoadSaveResultData);
}
export declare const QueryCompleteEventName: "model-save-load-query-complete";
export declare class QueryCompleteEvent extends CustomEvent<LoadSaveResultData> {
    constructor(detail: LoadSaveResultData);
}
export declare const QuickSaveDoneEventName: "model-save-load-quick-save-done";
export declare class QuickSaveDoneEvent extends CustomEvent<LoadSaveResultData> {
    constructor(detail: LoadSaveResultData);
}
declare class SaveLoadModel {
    private static _Instance;
    /**
     * Singleton accessor
     */
    static getInstance(): SaveLoadModel;
    private queryIds;
    private _saves;
    get saves(): SaveGameInfo[];
    set saves(value: SaveGameInfo[]);
    constructor();
    /**
     * Using an update gate for the model so it isn't set to be updated on the same
     * frame as when a possible update just occurred, as this can cause lock up from
     * an infinitiely dirty model.
     */
    updateGate: any;
    update(props: SaveLoadModelPartial): void;
    clearQueries(id?: number): void;
    querySaveGameList(saveLocation: SaveLocations, saveType: SaveTypes, locationOption: SaveLocationCategories, saveFileType: SaveFileTypes, options?: {
        isOverwriteQueryIds?: boolean;
    }): void;
    onFileListQueryResults(queryId: number, fileList: FileQueryEntry[]): void;
    updateSavesWithFileQueryEntries(fileList: FileQueryEntry[]): void;
    private onQueryComplete;
    handleDelete(saveGame: SaveGameInfo): any;
    private onSyncComplete;
    private onResolveConflict;
    private onRemoveComplete;
    handleSave(fileName: string, saveType: SaveTypes, saveLocation: SaveLocations, saveFileType: SaveFileTypes): any;
    handleQuickSave(): any;
    handleOverwrite(fileName: string, saveType: SaveTypes, saveLocation: SaveLocations, saveFileType: SaveFileTypes): any;
    onSaveComplete(result: LoadSaveResultData): void;
    onLoadComplete(result: LoadSaveResultData): void;
    handleQuickLoad(): void;
    handleLoadSave(saveGame: SaveGameInfo, serverType: ServerType): any;
    createLocationFullConfirm(): void;
    createQuotaExceededConfirm(): void;
}
declare const SaveLoadData: SaveLoadModel;
export { SaveLoadData as default };
declare global {
    interface HTMLElementEventMap {
        [QuickSaveDoneEventName]: QuickSaveDoneEvent;
        [SaveDoneEventName]: SaveDoneEvent;
        [QueryCompleteEventName]: QueryCompleteEvent;
        [QueryDoneEventName]: QueryDoneEvent;
        [DeleteDoneEventName]: DeleteDoneEvent;
    }
}
