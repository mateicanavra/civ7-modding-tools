export declare namespace RandomPCG32 {
    class RandomState {
        state: bigint;
        inc: bigint;
    }
    function seed(value: number): void;
    function rand(): number;
    function fRand(strLog: string): number;
    function getRandomNumber(iRange: number, strLog: string): number;
    function getState(): RandomState;
    function setState(state: RandomState): void;
    const randomPCG32State: RandomState;
}
export declare namespace GameCoreRandom {
    class RandomState {
        state: bigint;
    }
    function seed(value: number): void;
    function rand(): bigint;
    function fRand(strLog: string): number;
    function getRandomNumber(iRange: number, strLog: string): number;
    function randomNormal(mean: number, stdDev: number, strLog: string): number;
    function randomNormal2(mean: number, stdDevBelow: number, stdDevAbove: number, strLog: string): number;
    function getState(): RandomState;
    function setState(state: RandomState): void;
    const randomState: RandomState;
}
export import RandomImpl = GameCoreRandom;
