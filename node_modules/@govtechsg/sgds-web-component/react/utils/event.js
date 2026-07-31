'use client';
/** Waits for a specific event to be emitted from an element. Ignores events that bubble up from child elements. */
function waitForEvent(el, eventName) {
    return new Promise(resolve => {
        function done(event) {
            if (event.target === el) {
                el.removeEventListener(eventName, done);
                resolve();
            }
        }
        el.addEventListener(eventName, done);
    });
}

export { waitForEvent };
//# sourceMappingURL=event.js.map
