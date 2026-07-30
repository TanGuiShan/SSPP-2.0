//
// Animates an element using keyframes. Returns a promise that resolves after the animation completes or gets canceled.
//
function animateTo(el, keyframes, options) {
    return new Promise(resolve => {
        if ((options === null || options === void 0 ? void 0 : options.duration) === Infinity) {
            throw new Error("Promise-based animations must be finite.");
        }
        const animation = el.animate(keyframes, Object.assign(Object.assign({}, options), { duration: prefersReducedMotion() ? 0 : options === null || options === void 0 ? void 0 : options.duration }));
        animation.addEventListener("cancel", resolve, { once: true });
        animation.addEventListener("finish", resolve, { once: true });
    });
}
//
// Tells if the user has enabled the "reduced motion" setting in their browser or OS.
//
function prefersReducedMotion() {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    return query.matches;
}
// We can't animate `height: auto`, but we can calculate the height and shim keyframes by replacing it with the
// element's scrollHeight before the animation.
function shimKeyframesHeightAuto(keyframes, calculatedHeight) {
    return keyframes.map(keyframe => (Object.assign(Object.assign({}, keyframe), { height: keyframe.height === "auto" ? `${calculatedHeight}px` : keyframe.height })));
}
//
// Stops all active animations on the target element. Returns a promise that resolves after all animations are canceled.
//
function stopAnimations(el) {
    return Promise.all(el.getAnimations().map(animation => {
        return new Promise(resolve => {
            const handleAnimationEvent = requestAnimationFrame(resolve);
            animation.addEventListener("cancel", () => handleAnimationEvent, { once: true });
            animation.addEventListener("finish", () => handleAnimationEvent, { once: true });
            animation.cancel();
        });
    }));
}

export { animateTo, prefersReducedMotion, shimKeyframesHeightAuto, stopAnimations };
//# sourceMappingURL=animate.js.map
