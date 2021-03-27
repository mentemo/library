import { List } from 'src/customTypings';
import BinaryBitmap from '../../BinaryBitmap';
import DecodeHintType from '../../DecodeHintType';
import QRCodeReader from '../../qrcode/QRCodeReader';
import Result from '../../Result';
import ResultPoint from '../../ResultPoint';
import MultipleBarcodeReader from '../MultipleBarcodeReader';
/**
 * This implementation can detect and decode multiple QR Codes in an image.
 *
 * @author Sean Owen
 * @author Hannes Erven
 */
export default class QRCodeMultiReader extends QRCodeReader implements MultipleBarcodeReader {
    private static EMPTY_RESULT_ARRAY;
    protected static NO_POINTS: ResultPoint[];
    /**
     * TYPESCRIPTPORT: this is an overloaded method so here it'll work only as a entrypoint for choosing which overload to call.
     */
    decodeMultiple(image: BinaryBitmap, hints?: Map<DecodeHintType, any>): Result[];
    /**
     * @throws NotFoundException
     * @override decodeMultiple
     */
    private decodeMultipleOverload1;
    /**
     * @override
     * @throws NotFoundException
     */
    private decodeMultipleImpl;
    static processStructuredAppend(results: List<Result>): List<Result>;
}
