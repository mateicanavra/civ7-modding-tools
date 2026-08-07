/**
 * @file model-notification-train.ts
 * @copyright 2021-2025, Firaxis Games
 * @description Handles notifications raised from game engine which may
 * require actions to be taken by player in order to progress.
 */
import { ComponentID } from "/core/ui/utilities/utilities-component-id.js";
export type NotificationType = number;
export type NotificationID = ComponentID;
export declare namespace NotificationModel {
    export enum QueryBy {
        InsertOrder = 0,
        Severity = 1,
        Priority = 2
    }
    export class TypeEntry {
        private _owner;
        private _type;
        private _notifications;
        constructor(type: number, player?: PlayerId);
        get isEmpty(): boolean;
        get type(): number;
        get owner(): PlayerId;
        get lowestID(): number;
        get highestPriority(): number;
        get highestSeverity(): number;
        get notifications(): NotificationID[];
        hasID(id: ComponentID): boolean;
        add(notificationId: NotificationID): void;
        remove(notificationId: NotificationID): boolean;
        get topID(): NotificationID | null;
    }
    export class GroupEntry {
        _owner: PlayerId;
        _type: number;
        _notifications: NotificationID[];
        constructor(type: number, player?: PlayerId);
        get owner(): PlayerId;
        get type(): number;
        get notifications(): ComponentID[];
        add(notificationId: NotificationID): void;
        remove(notificationId: NotificationID): boolean;
        getActive(): NotificationID | null;
    }
    type TypeArray = TypeEntry[];
    export class PlayerEntry {
        private _groups;
        private _types;
        private _owner;
        constructor(player?: PlayerId);
        get groups(): Record<number, GroupEntry | null>;
        get types(): Record<number, TypeEntry | null>;
        get owner(): PlayerId;
        addType(type: number): TypeEntry;
        findType(type: number): TypeEntry | null;
        /**
         * getTypesBy returns an array of sorted TypeEntry objects
         *
         * @param queryBy The sorting method for the results
         * @param includeBlockers Whether or not to include blockers in the results.
         */
        getTypesBy(queryBy: QueryBy, includeBlockers?: boolean): TypeArray;
        addGroup(type: number): GroupEntry;
        findGroup(type: number): GroupEntry | null;
        remove(notificationId: NotificationID): boolean;
    }
    export interface Handler {
        lookAt(notificationId: NotificationID): void;
        add(notificationId: NotificationID): boolean;
        dismiss(notificationId: NotificationID): void;
        activate(notificationId: NotificationID, activatedBy?: PlayerId | null): boolean;
    }
    export type HandlerMap = Record<number, Handler>;
    export class NotificationTrainManagerImpl {
        private needRebuild;
        private handlers;
        private players;
        private defaultHandler;
        private _eventNotificationAdd;
        private _eventNotificationRemove;
        private _eventNotificationRebuild;
        private _eventNotificationUpdate;
        private _eventNotificationHide;
        private _eventNotificationHighlight;
        private _eventNotificationUnHighlight;
        private _eventNotificationDoFX;
        lastAnimationTurn: number;
        lastMobileNotificationTurn: number;
        refreshAfterFX: boolean;
        get eventNotificationAdd(): any;
        get eventNotificationRemove(): any;
        get eventNotificationRebuild(): any;
        get eventNotificationUpdate(): any;
        get eventNotificationHide(): any;
        get eventNotificationHighlight(): any;
        get eventNotificationUnHighlight(): any;
        get eventNotificationDoFX(): any;
        constructor();
        private reset;
        registerHandler(hashId: HashId, handler: Handler): void;
        setDefaultHandler(handler: Handler): void;
        findHandler(type: number | null): Handler | null;
        private removePlayer;
        private addPlayer;
        findPlayer(player: PlayerId): PlayerEntry | null;
        add(notificationType: number, groupType: number, notificationId: NotificationID): void;
        remove(notificationId: NotificationID): void;
        getNotificationCount(playerId: PlayerId): number;
        onDismiss(notificationId: NotificationID): void;
        dismissByType(type: number): void;
        dismiss(notificationId: NotificationID): void;
        findTypeEntry(notificationId: NotificationID): TypeEntry | null;
        lookAt(notificationId: NotificationID): void;
        activate(notificationId: NotificationID): void;
        rebuild(): void;
        playAudio(notificationID: ComponentID, context: string): void;
        updateNotifications(): void;
        private onPlayerTurnActivated;
        private onNotificationAdded;
        private onNotificationDismissed;
        private onNotificationActivated;
        private onNotificationUpdated;
        private onEventPlaybackComplete;
    }
    export const manager: NotificationTrainManagerImpl;
    export {};
}
