'use client';
const locks = new Set();
/**
 * Prevents body scrolling. Keeps track of which elements requested a lock so multiple levels of locking are possible
 * without premature unlocking.
 */
function lockBodyScrolling(lockingEl) {
    locks.add(lockingEl);
    document.body.style.overflow = "hidden";
}
/**
 * Unlocks body scrolling. Scrolling will only be unlocked once all elements that requested a lock call this method.
 */
function unlockBodyScrolling(lockingEl) {
    locks.delete(lockingEl);
    if (locks.size === 0) {
        document.body.style.overflow = "";
    }
}

export { lockBodyScrolling, unlockBodyScrolling };
//# sourceMappingURL=scroll.js.map
