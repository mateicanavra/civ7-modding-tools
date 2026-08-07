/**
 * @file utilities-component-id.ts
 * @copyright 2021-2026, Firaxis Games
 * @description Utilties for working with ComponentIDs
 */
export type BitfieldComponentID = bigint;
export declare namespace ComponentID {
    enum UITypes {
        IndependentBanner = 1000
    }
    const cid_type = 30;
    function toString(id: ComponentID | null): string;
    function fromString(str: string | undefined | null): ComponentID;
    /**
     * Do two component IDs match? Assumes both are non-null.
     * @param {ComponentID | null} id1 non-null ComponentID
     * @param {ComponentID | null} id2 non-null ComponentID
     * @returns {boolean} true if both ComponentIDs contain the same values, false otherwise.
     */
    function isMatch(id1: ComponentID | null, id2: ComponentID | null): boolean;
    /**
     * Does a component ID (CID) exist within an array of CIDs?
     * @param {ComponentId[]} ids array of CIDs to check
     * @param {ComponentId} id the CID to look for
     * @returns {boolean} true if CID is in array, false otherwise
     */
    function isMatchInArray(ids: ComponentID[], id: ComponentID): boolean;
    function isInstanceOf(thing: any): thing is NonNullable<ComponentID>;
    function addToArray(ids: ComponentID[] | null, id: ComponentID | null): boolean;
    function removeFromArray(ids: ComponentID[] | null, id: ComponentID | null): boolean;
    /**
     * Check if a component ID is anything but an unset value.
     * Technically only check if set (not checking validity against gamecore.)
     * @param {ComponentID} componentID - target component ID to check
     * @return true if unset/null/empty component ID, false if set or null passed in
     */
    function isInvalid(id: ComponentID): boolean;
    /**
     * Check if a component ID is valid.
     * @param {ComponentID} componentID - target component ID to check
     * @return true if likely a valid component id.
     */
    function isValid(id: ComponentID | null): id is NonNullable<ComponentID>;
    function getInvalidID(): ComponentID;
    /**
     * @description Convert a ComponentID into it's 64-bit bitfield representation.
     *  ________________________________________________________________
     * | owner 16-bits | type 16-bits  |           id 32-bits           |
     * |_______________|_______________|________________________________|
     *
     * @note Cannot just immediate bit shift 32 or 48 spaces, after 31 javascript say nope so getting tricky with powers.
     */
    function toBitfield(componentID: ComponentID): BitfieldComponentID;
    /**
     * Restore a ComponentID from it's single 64-bit bitfield representation.
     * @param bitfield A packed bitfield created with toBitfield
     * @returns The expanded ComponentID number.
     */
    function fromBitfield(bitfield: BitfieldComponentID): ComponentID;
    /**
     * @description Convert a ComponentID into it's 64-bit bitfield representation.
     *  ________________________________________________________________
     * |               |               |          (id 32-bits)          |
     * | owner 16-bits | type 16-bits  |    x 16-bits   |   y 16-bits   |
     * |_______________|_______________|________________|_______________|
     *
     * @note Cannot just immediate bit shift 32 or 48 spaces, after 31 javascript say nope so getting tricky with powers.
     */
    function fromPlot(owner: number, coordinates: PlotCoord, type: number): ComponentID;
    function typeToString(type: number): string;
    /**
     * Converts component ID into human readable info
     * For debugging, log messages, etc... only.
     * Type enums from GameCore_PlayerComponentID.h,
     * @param {ComponentID} id - The component ID
     * @return a string representing a debug view of the component ID
     */
    function toLogString(id: ComponentID): string;
    /**
     * Determine if a cid is engine specific or UI specific.
     * @param cid A componentID
     * @returns true if the cid is specific to the user interface and not tracked by the engine.
     */
    function isUI(cid: ComponentID): boolean;
    /**
     * Create a ComponentID from an owner, type, and id.
     * @param {number} owner Player number
     * @param {number} type (-1) The type of component being created
     * @param {number} id 	Unique ID
     * @returns {ComponentID} A fully formed ComponentID.
     */
    function make(owner: number, type: number | undefined, id: number): ComponentID;
}
