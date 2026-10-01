/**
 * @file utility-serialize.ts
 * @copyright 2024-2026, Firaxis Games
 * @description Provides a "catalog" to store and retrieve arbitrary key/values.
 *
 * 	A catalog will behave in one of two ways: as a "game" catalog or "player" catalog.
 *
 *	Which mode is set by what is passed to the constructor.
 * 		- If a player is provided, it will be a player catalog, otherwise a game catalog.
 *		- Game catalogs are local only, and their values can be immediately read back after writing.
 *		- Player catalogs are internally written to the cache via a "player operation"; requiring a wait until the value is committed for reading back.
 *
 *	OFFERS
 *	- A way to store and retrieve simple typed value using a key (string).
 * 	- Scoping of one level deep of objects with multiple properties.
 * 	- Has a mechanism to enumerate the keys written.
 * 	- Has a mechanism to signal when a value is committed.
 *
 *	UNDER THE HOOD
 *	There is just a flat list (per-player) of key/value pairs.
 *	The actual key is a uint32 which is a hash of the catalog name, object name, and property name.
 *
 *	IN SUMMARY
 *	A top level "catalog" object tracks all the objects in the store.
 *	Each object can have multiple properties read/written
 *
 *	LAYOUT EXAMPLE
 *	Full Key (as string):			Data:								Description
 * 	------------------------------- ----------------------------------- ---------------------
 *  _catalogs_index					<catalogid1>,...,<catalogidN>		Comma separated list of catalog names.
 *	_MyStuff__KEYS					<objid1>,<objid2>, ... ,<objidN>	Comma separated list of objects in this catalog by their ID.
 *	_MyStuff_OBJ_<objid1>_KEYS		<key1>,<key2, ... ,<keyN>			Comma separated list of properties for object 1 by their key.
 *	_MyStuff_OBJ_<objid1>_<key1>	<value1>							key and value of first item on this object
 * 		:
 *	_MyStuff_OBJ_<objid1>_<keyN>	<valueN>
 * 		:
 * 		:
 *	_MyStuff_OBJ_<objidN>_KEYS		<key1>,<key2, ... ,<keyN>			The keys written for object N.
 *	_MyStuff_OBJ_<objidN>_<key1>	<value1>							key and value of first item on object N
 * 		:
 *  _MyStuff_OBJ_<objidN>_<keyN>	<valueN>							key and value of last item on object N
 *
 * @usage
 * // World Exanmple
 * const catalog = new Catalog({name:"GeneralStuff", version: 1234});
 * const obj = catalog.getObject("foo");
 * const old = obj.read("someStuff") as string;
 * obj.write("someOtherStuff","crabcakes are delicious")
 *
 * // Player Example
 * // Setup callback first, this will get signaled when the value is committed from the cache.
 *	window.addEventListener(CatalogItemCommittedEventName, (event: CatalogItemCommittedEvent) => {
 *		if (event.detail.catalogId === "MyStuff" && event.detail.objectId === "fireworks" && event.detail.key === "sparklers") {
 *			const newAmount = fireworks.read("sparklers") as number;
 *			console.log(`new amount: ${newAmount}`);
 *		}
 *	});
 * // Now read existing values and throw to the cache any values to be written.
 *	const myCatalog = new Catalog({ name: "MyStuff", version: 1, player: Players.get(GameContext.localPlayerID) });
 *	const fireworks = myCatalog.getObject("fireworks");
 *	const num = (fireworks.read("sparklers") as number) ?? 0;
 *	fireworks.write("sparklers", num + 1);
 */
/** Types allowed to be serialized. */
export type SerializeType = string | number | boolean;
/**
 * An object for reading/writing a group of properties.
 */
export declare class SerialObject {
    private readonly id;
    private readonly scope;
    private readonly catalogId;
    private readonly player;
    private readonly hashPreamble;
    private propertyKeys;
    private hashCache;
    /**
     * CTOR
     * @param id name of the object
     * @param scope name used as part of the hash
     * @param catalogId untouched catalog id needed for tracking
     * @param player (null) set to a Player if not a world catalog
     */
    constructor(id: string, scope: string, catalogId: string, player?: PlayerLibrary | null);
    /**
     * Retrieves the hash for a key if it exists.
     * If not, generate the hash, save it, and return it.
     */
    private getCachedHash;
    /**
     * @returns a collection of IDs maintained by this object.
     */
    getKeys(): Set<string>;
    /**
     * DEBUG Helper
     * @returns a comma-separated lsit of IDs maintained by this object.
     */
    private getKeysAsString;
    /**
     * Read a single value.
     * @returns the value for the given key, or undefined if not existing.
     */
    read(key: string): SerializeType;
    /**
     * Request a write of a single value.
     * If the game store, the write happens immediate.
     * If a player store, the write is queued to be committed by the cache.
     * The commited value is signaled from the App side by an event.
     */
    write(key: string, value: SerializeType): void;
}
export interface CatalogProperties {
    name: string;
    version?: number;
    player?: PlayerLibrary | null;
}
/**
 * Top level class that maintains the catalog of serialized objects.
 */
export declare class Catalog {
    readonly name: string;
    private _player;
    private _fileVersion;
    private _runningVersion;
    private _justCreated;
    private readonly hashPreamble;
    private objectIDs;
    get fileVersion(): number;
    get runningVersion(): number;
    get justCreated(): boolean;
    /**
     * CTOR
     */
    constructor(properties: CatalogProperties);
    /**
     * If a catalog ever needs to be explicitly cleaned up; call this.
     */
    dispose(): void;
    /** Names of the objects stored in the catalog */
    getObjectIds(): Set<string>;
    /**
     * Register this catalog with the index, so that it can be enumerated.
     * This may be used in the future; such as if we prevent catalogs from
     * being copied across an age transition boundary, etc.
     */
    private registerWithCatalogIndex;
    /** Listener for player property changes having been committed. */
    private onPlayerDynamicPropertyChanged;
    /**
     * Read/Write the meta information for this catalog.
     * @param version (0) The version of system-specific information.
     */
    private realizeInfoBlock;
    getObject(id: string): SerialObject;
    exists(id: string): boolean;
    /**
     * DEBUG Helper
     * Outputs the entire contents of the catalog to the console as an ASCII tree.
     * Flags values with "(PENDING #)" if they have outstanding cache commits.
     */
    dumpToLog(): void;
}
/**
 * CatalogItemCommittedEvent is triggered when a catalog item is committed.
 */
export interface CatalogItemCommittedEventDetail {
    playerId: PlayerId;
    hash: HashId;
    catalogId: string;
    objectId: string;
    key: string;
}
export declare const CatalogItemCommittedEventName: "catalog-item-committed";
export declare class CatalogItemCommittedEvent extends CustomEvent<CatalogItemCommittedEventDetail> {
    constructor(playerId: PlayerId, hash: HashId, catalogId: string, objectId: string, key: string);
}
export declare function addTrackingEntry(playerId: PlayerId, hash: HashId, catalogId: string, objectId: string, key: string): void;
interface TrackingResult {
    amount: number;
    catalogId: string;
    objectId: string;
    key: string;
}
/**
 * Remove a tracking entry for a player and hash.
 * @param playerId The ID of the player for whom to remove the tracking entry.
 * @param hash Hash of kru for which to remove the tracking entry.
 * @returns An object containing the remaining amount and the key.
 */
export declare function removeTrackingEntry(playerId: PlayerId, hash: HashId): TrackingResult;
export {};
