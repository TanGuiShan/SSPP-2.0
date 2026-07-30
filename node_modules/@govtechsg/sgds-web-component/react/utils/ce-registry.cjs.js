'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 *
 * @param name tagname of custom element
 * @returns boolean
 */
function isRegistered(name) {
    return !!customElements.get(name);
}
function register(name, constructor) {
    if (!customElements.get(name)) {
        customElements.define(name, constructor);
    }
}
function warnUnregisteredElements(name) {
    if (isRegistered(name)) {
        return true;
    }
    else {
        console.error(`Custom element of name : ${name} is not registered. Remember to import the component file for custom element registration`);
        return false;
    }
}

exports.isRegistered = isRegistered;
exports.register = register;
exports.warnUnregisteredElements = warnUnregisteredElements;
//# sourceMappingURL=ce-registry.cjs.js.map
