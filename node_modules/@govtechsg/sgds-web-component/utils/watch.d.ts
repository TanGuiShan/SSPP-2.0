import type { LitElement } from "lit";
type UpdateHandler = (prev?: unknown, next?: unknown) => void;
type NonUndefined<A> = A extends undefined ? never : A;
type UpdateHandlerFunctionKeys<T extends object> = {
    [K in keyof T]-?: NonUndefined<T[K]> extends UpdateHandler ? K : never;
}[keyof T];
interface WatchOptions {
    /**
     * If true, will only start watching after the initial update/render
     */
    waitUntilFirstUpdate?: boolean;
}
export declare function watch(propName: string, options?: WatchOptions): <ElemClass extends LitElement>(proto: ElemClass, decoratedFnName: UpdateHandlerFunctionKeys<ElemClass>) => void;
export {};
