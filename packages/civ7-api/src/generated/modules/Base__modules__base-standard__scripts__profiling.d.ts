export declare class profileScope {
    private m_startTime;
    private m_name;
    constructor(name: string);
    end(): void;
}
export declare function profileFunction<T = unknown>(name: string, func: () => T): T;
