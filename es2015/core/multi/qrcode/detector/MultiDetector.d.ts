import BitMatrix from '../../../common/BitMatrix';
import DetectorResult from '../../../common/DetectorResult';
import DecodeHintType from '../../../DecodeHintType';
import Detector from '../../../qrcode/detector/Detector';
/**
 * <p>Encapsulates logic that can detect one or more QR Codes in an image, even if the QR Code
 * is rotated or skewed, or partially obscured.</p>
 *
 * @author Sean Owen
 * @author Hannes Erven
 */
export default class MultiDetector extends Detector {
    private static EMPTY_DETECTOR_RESULTS;
    constructor(image: BitMatrix);
    /** @throws NotFoundException */
    detectMulti(hints: Map<DecodeHintType, any>): DetectorResult[];
}
