'use client';
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var lit = require('lit');

// @defaultValue decorator
const defaultValue = (propertyName = "value") => (proto, key) => {
    const ctor = proto.constructor;
    const attributeChangedCallback = ctor.prototype.attributeChangedCallback;
    ctor.prototype.attributeChangedCallback = function (name, old, value) {
        var _a;
        const options = ctor.getPropertyOptions(propertyName);
        const attributeName = (typeof options.attribute === "string" ? options.attribute : propertyName).toLowerCase();
        if (name === attributeName) {
            const converter = options.converter || lit.defaultConverter;
            const fromAttribute = typeof converter === "function" ? converter : (_a = converter === null || converter === void 0 ? void 0 : converter.fromAttribute) !== null && _a !== void 0 ? _a : lit.defaultConverter.fromAttribute;
            const newValue = fromAttribute(value, options.type);
            if (this[propertyName] !== newValue) {
                this[key] = newValue;
            }
        }
        attributeChangedCallback.call(this, name, old, value);
    };
};

exports.defaultValue = defaultValue;
//# sourceMappingURL=defaultvalue.cjs.js.map
