"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Ponyfill for Java's Float class.
 */
var Float = /** @class */ (function () {
    function Float() {
    }
    /**
     * SincTS has no difference between int and float, there's all numbers,
     * this is used only to polyfill Java code.
     */
    Float.floatToIntBits = function (f) {
        return f;
    };
    Float.isNaN = function (num) {
        return isNaN(num);
    };
    Float.compare = function (x, y) {
        if (x === y)
            return 0;
        if (x < y)
            return -1;
        if (x > y)
            return 1;
    };
    /**
     * The float max value in JS is the number max value.
     */
    Float.MAX_VALUE = Number.MAX_SAFE_INTEGER;
    Float.NaN = NaN;
    return Float;
}());
exports.default = Float;
//# sourceMappingURL=Float.js.map