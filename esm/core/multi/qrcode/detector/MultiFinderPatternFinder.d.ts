import BitMatrix from '../../../common/BitMatrix';
import DecodeHintType from '../../../DecodeHintType';
import FinderPatternFinder from '../../../qrcode/detector/FinderPatternFinder';
import FinderPatternInfo from '../../../qrcode/detector/FinderPatternInfo';
import ResultPointCallback from '../../../ResultPointCallback';
/**
 * <p>This class attempts to find finder patterns in a QR Code. Finder patterns are the square
 * markers at three corners of a QR Code.</p>
 *
 * <p>This class is thread-safe but not reentrant. Each thread must allocate its own object.
 *
 * <p>In contrast to {@link FinderPatternFinder}, this class will return an array of all possible
 * QR code locations in the image.</p>
 *
 * <p>Use the TRY_HARDER hint to ask for a more thorough detection.</p>
 *
 * @author Sean Owen
 * @author Hannes Erven
 */
export default class MultiFinderPatternFinder extends FinderPatternFinder {
    private static EMPTY_RESULT_ARRAY;
    private static EMPTY_FP_ARRAY;
    private static EMPTY_FP_2D_ARRAY;
    private static MAX_MODULE_COUNT_PER_EDGE;
    private static MIN_MODULE_COUNT_PER_EDGE;
    /**
     * More or less arbitrary cutoff point for determining if two finder patterns might belong
     * to the same code if they differ less than DIFF_MODSIZE_CUTOFF_PERCENT percent in their
     * estimated modules sizes.
     */
    private static DIFF_MODSIZE_CUTOFF_PERCENT;
    /**
     * More or less arbitrary cutoff point for determining if two finder patterns might belong
     * to the same code if they differ less than DIFF_MODSIZE_CUTOFF pixels/module in their
     * estimated modules sizes.
     */
    private static DIFF_MODSIZE_CUTOFF;
    constructor(image: BitMatrix, resultPointCallback: ResultPointCallback);
    /**
     * @return the 3 best {@link FinderPattern}s from our list of candidates. The "best" are
     *         those that have been detected at least 2 times, and whose module
     *         size differs from the average among those patterns the least
     * @throws NotFoundException if 3 such finder patterns do not exist
     */
    private selectMultipleBestPatterns;
    /**
     * @throws NotFoundException
     */
    findMulti(hints: Map<DecodeHintType, any>): FinderPatternInfo[];
}
