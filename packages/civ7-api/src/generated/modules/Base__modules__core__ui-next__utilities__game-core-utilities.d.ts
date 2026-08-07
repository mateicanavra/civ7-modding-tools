import { Accessor } from "solid-js";
/**
 * Exposes a Game Core event to SolidJS with appropriate lifecycle handling
 * Uses reference counting so events are only subscribed to a single time across multiple components
 * @param name The Game Core engine event name
 * @returns
 */
export declare function createEngineEvent<Name extends GameCoreEvent["name"]>(name: Name | string): Accessor<Extract<GameCoreEvent, {
    name: Name;
}>["payload"]>;
/**
 * Gamecore does not like it when optional properties are set to undefined instead of being deleted.
 * This function deletes any undefined keys off of an object
 * @param object The object to clean
 * @returns A clean version of the object without undefined keys
 */
export declare function cleanObject<T>(object: T): T;
/**
 * Access the local player as a reactive signal that will be updated whenever the local player changes.
 * This is commonly used to better support HotSeat.
 */
export declare function useLocalPlayerId(): Accessor<PlayerId>;
