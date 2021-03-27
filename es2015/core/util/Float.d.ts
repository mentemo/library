import { float, int } from 'src/customTypings';
/**
 * Ponyfill for Java's Float class.
 */
export default class Float {
    /**
     * The float max value in JS is the number max value.
     */
    static MAX_VALUE: number;
    static NaN: number;
    /**
     * SincTS has no difference between int and float, there's all numbers,
     * this is used only to polyfill Java code.
     */
    static floatToIntBits(f: number): number;
    static isNaN(num: number): boolean;
    static compare(x: float, y: float): int;
}
