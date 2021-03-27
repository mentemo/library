import { int } from "src/customTypings";
/**
 * Ponyfill for Java's Integer class.
 */
export default class Integer {
    static MIN_VALUE_32_BITS: number;
    static MAX_VALUE: number;
    /**
     * Parameter :
     * x : the first int to compare
     * y : the second int to compare
     * Return :
     * This method returns the value zero if (x==y),
     * if (x < y) then it returns a value less than zero
     * and if (x > y) then it returns a value greater than zero.
     */
    static compare(x: int, y: int): number;
    static numberOfTrailingZeros(i: number): number;
    static numberOfLeadingZeros(i: number): number;
    static toHexString(i: number): string;
    static toBinaryString(intNumber: number): string;
    static bitCount(i: number): number;
    static truncDivision(dividend: number, divisor: number): number;
    /**
     * Converts A string to an integer.
     * @param s A string to convert into a number.
     * @param radix A value between 2 and 36 that specifies the base of the number in numString. If this argument is not supplied, strings with a prefix of '0x' are considered hexadecimal. All other strings are considered decimal.
     */
    static parseInt(num: string, radix?: number): number;
}
