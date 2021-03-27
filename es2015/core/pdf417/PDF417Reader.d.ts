import BinaryBitmap from '../BinaryBitmap';
import DecodeHintType from '../DecodeHintType';
import Reader from '../Reader';
import Result from '../Result';
import MultipleBarcodeReader from '../multi/MultipleBarcodeReader';
/**
 * This implementation can detect and decode PDF417 codes in an image.
 *
 * @author Guenther Grau
 */
export default class PDF417Reader implements Reader, MultipleBarcodeReader {
    /**
     * Locates and decodes a PDF417 code in an image.
     *
     * @return a String representing the content encoded by the PDF417 code
     * @throws NotFoundException if a PDF417 code cannot be found,
     * @throws FormatException if a PDF417 cannot be decoded
     * @throws ChecksumException
     * @override decode
     */
    decode(image: BinaryBitmap, hints?: Map<DecodeHintType, any>): Result;
    /**
     *
     * @override decodeMultiple
     */
    decodeMultiple(image: BinaryBitmap): Result[];
    /**
     *
     * @override decodeMultiple
     */
    private decodeMultipleOverload1;
    /**
     *
     * @param BinaryBitmap
     * @param image
     * @throws NotFoundException
     * @override
     */
    private decodeMultipleImpl;
    /**
     *
     * @param image
     * @param hints
     * @param multiple
     *
     * @throws NotFoundException
     * @throws FormatExceptionß
     * @throws ChecksumException
     */
    private static decode;
    private static getMaxWidth;
    private static getMinWidth;
    private static getMaxCodewordWidth;
    private static getMinCodewordWidth;
    reset(): void;
}
