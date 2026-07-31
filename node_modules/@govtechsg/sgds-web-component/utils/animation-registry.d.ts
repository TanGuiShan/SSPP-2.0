export interface ElementAnimation {
    keyframes: Keyframe[];
    rtlKeyframes?: Keyframe[];
    options?: KeyframeAnimationOptions;
}
export interface ElementAnimationMap {
    [animationName: string]: ElementAnimation;
}
export interface GetAnimationOptions {
    /**
     * The component's directionality. When set to "rtl", `rtlKeyframes` will be preferred over `keyframes` where
     * available using getAnimation().
     */
    dir: string;
}
export declare function getAnimation(el: Element, animationName: string): ElementAnimation;
export declare function setAnimation(el: Element, animationName: string, animation: ElementAnimation | null): void;
export declare function setDefaultAnimation(animationName: string, animation: ElementAnimation | null): void;
