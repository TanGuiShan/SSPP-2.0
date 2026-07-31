'use client';
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

export { isRegistered, register, warnUnregisteredElements };
//# sourceMappingURL=ce-registry.js.map
