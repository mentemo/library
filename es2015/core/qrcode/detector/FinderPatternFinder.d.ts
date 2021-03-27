import BitMatrix from '../../common/BitMatrix';
import DecodeHintType from '../../DecodeHintType';
import ResultPointCallback from '../../ResultPointCallback';
import { int, List } from '../../../customTypings';
import FinderPattern from './FinderPattern';
import FinderPatternInfo from './FinderPatternInfo';
/**
 * <p>This class attempts to find finder patterns in a QR Code. Finder patterns are the square
 * markers at three corners of a QR Code.</p>
 *
 * <p>This class is thread-safe but not reentrant. Each thread must allocate its own object.
 *
 * @author Sean Owen
 */
export default class FinderPatternFinder {
    private static CENTER_QUORUM;
    private static moduleComparator;
    protected static MIN_SKIP: int;
    protected static MAX_MODULES: int;
    private image;
    private possibleCenters;
    private hasSkipped;
    private crossCheckStateCount;
    private resultPointCallback;
    /**
     * <p>Creates a finder that will search the image for three finder patterns.</p>
     *
     * @param image image to search
     */
    private constructorOverload1;
    /**
   * @param image image to search
   * @param resultPointCallback
   */
    private constructorOverload2;
    /**
     * @param image image to search
     */
    constructor(image: BitMatrix, resultPointCallback?: ResultPointCallback);
    protected getImage(): BitMatrix;
    protected getPossibleCenters(): List<FinderPattern>;
    /**
     *
     * @throws NotFoundException
     */
    find(hints: Map<DecodeHintType, any>): FinderPatternInfo;
    /**
     * Given a count of black/white/black/white/black pixels just seen and an end position,
     * figures the location of the center of this run.
     */
    private static centerFromEnd;
    /**
     * @param stateCount count of black/white/black/white/black pixels just read
     * @return true iff the proportions of the counts is close enough to the 1/1/3/1/1 ratios
     *         used by finder patterns to be considered a match
     */
    protected static foundPatternCross(stateCount: Int32Array): boolean;
    /**
     * @param stateCount count of black/white/black/white/black pixels just read
     * @return true iff the proportions of the counts is close enough to the 1/1/3/1/1 ratios
     *         used by finder patterns to be considered a match
     */
    protected static foundPatternDiagonal(stateCount: Int32Array): boolean;
    private getCrossCheckStateCount;
    protected clearCounts(counts: Int32Array): void;
    protected shiftCounts2(stateCount: Int32Array): void;
    /**
     * After a vertical and horizontal scan finds a potential finder pattern, this method
     * "cross-cross-cross-checks" by scanning down diagonally through the center of the possible
     * finder pattern to see if the same proportion is detected.
     *
     * @param centerI row where a finder pattern was detected
     * @param centerJ center of the section that appears to cross a finder pattern
     * @return true if proportions are withing expected limits
     */
    private crossCheckDiagonal;
    /**
     * <p>After a horizontal scan finds a potential finder pattern, this method
     * "cross-checks" by scanning down vertically through the center of the possible
     * finder pattern to see if the same proportion is detected.</p>
     *
     * @param startI row where a finder pattern was detected
     * @param centerJ center of the section that appears to cross a finder pattern
     * @param maxCount maximum reasonable number of modules that should be
     * observed in any reading state, based on the results of the horizontal scan
     * @return vertical center of finder pattern, or {@link Float#NaN} if not found
     */
    private crossCheckVertical;
    /**
     * <p>Like {@link #crossCheckVertical(int, int, int, int)}, and in fact is basically identical,
     * except it reads horizontally instead of vertically. This is used to cross-cross
     * check a vertical cross check and locate the real center of the alignment pattern.</p>
     */
    private crossCheckHorizontal;
    /**
     * @param stateCount reading state module counts from horizontal scan
     * @param i row where finder pattern may be found
     * @param j end of possible finder pattern in row
     * @param pureBarcode ignored
     * @return true if a finder pattern candidate was found this time
     * @deprecated only exists for backwards compatibility
     * @see #handlePossibleCenter(Int32Array, int, int)
     * @Deprecated
     */
    protected handlePossibleCenterX(stateCount: Int32Array, i: int, j: int, pureBarcode: boolean): boolean;
    /**
     * <p>This is called when a horizontal scan finds a possible alignment pattern. It will
     * cross check with a vertical scan, and if successful, will, ah, cross-cross-check
     * with another horizontal scan. This is needed primarily to locate the real horizontal
     * center of the pattern in cases of extreme skew.
     * And then we cross-cross-cross check with another diagonal scan.</p>
     *
     * <p>If that succeeds the finder pattern location is added to a list that tracks
     * the number of times each location has been nearly-matched as a finder pattern.
     * Each additional find is more evidence that the location is in fact a finder
     * pattern center
     *
     * @param stateCount reading state module counts from horizontal scan
     * @param i row where finder pattern may be found
     * @param j end of possible finder pattern in row
     * @return true if a finder pattern candidate was found this time
     */
    protected handlePossibleCenter(stateCount: Int32Array, i: int, j: int): boolean;
    /**
     * @return number of rows we could safely skip during scanning, based on the first
     *         two finder patterns that have been located. In some cases their position will
     *         allow us to infer that the third pattern must lie below a certain point farther
     *         down in the image.
     */
    private findRowSkip;
    /**
     * @return true iff we have found at least 3 finder patterns that have been detected
     *         at least {@link #CENTER_QUORUM} times each, and, the estimated module size of the
     *         candidates is "pretty similar"
     */
    private haveMultiplyConfirmedCenters;
    /**
     * Get square of distance between a and b.
     */
    private static squaredDistance;
    /**
     * @return the 3 best {@link FinderPattern}s from our list of candidates. The "best" are
     *         those have similar module size and form a shape closer to a isosceles right triangle.
     * @throws {@link NotFoundException} if 3 such finder patterns do not exist
     */
    private selectBestPatterns;
}
