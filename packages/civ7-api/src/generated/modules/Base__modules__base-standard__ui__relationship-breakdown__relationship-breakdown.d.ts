export declare class RelationshipBreakdown {
    readonly root: any;
    private readonly sectionLineAbove;
    private readonly sectionLineBelow;
    private readonly relationshipItemsContainer;
    private readonly relationshipIcon;
    private readonly relationshipName;
    private readonly relationshipAmount;
    constructor(playerA: PlayerId, playerB?: any);
    update(otherPlayer: PlayerId, localPlayer?: any): void;
}
