/**
 * Ponyfill for Java's Float class.
 */
export default class Float {
    /**
     * SincTS has no difference between int and float, there's all numbers,
     * this is used only to polyfill Java code.
     */
    static floatToIntBits(f) {
        return f;
    }
    static isNaN(num) {
        return isNaN(num);
    }
    static compare(x, y) {
        if (x === y)
            return 0;
        if (x < y)
            return -1;
        if (x > y)
            return 1;
    }
}
/**
 * The float max value in JS is the number max value.
 */
Float.MAX_VALUE = Number.MAX_SAFE_INTEGER;
Float.NaN = NaN;
//# sourceMappingURL=Float.js.map