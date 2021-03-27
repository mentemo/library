/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import DecodeHintType from '../../DecodeHintType';
import NotFoundException from '../../NotFoundException';
import ResultPoint from '../../ResultPoint';
import Arrays from '../../util/Arrays';
import Double from '../../util/Double';
import Float from '../../util/Float';
import FinderPattern from './FinderPattern';
import FinderPatternInfo from './FinderPatternInfo';
// package com.google.zxing.qrcode.detector;
// import com.google.zxing.DecodeHintType;
// import com.google.zxing.NotFoundException;
// import com.google.zxing.ResultPoint;
// import com.google.zxing.ResultPointCallback;
// import com.google.zxing.common.BitMatrix;
// import java.io.Serializable;
// import java.util.ArrayList;
// import java.util.Arrays;
// import java.util.Comparator;
// import java.util.List;
// import java.util.Map;
// TYPESCRIPTPORT: this class woudl normaly exist at the end of this file, but it's here due to ESLint.
/**
 * <p>Orders by {@link FinderPattern#getEstimatedModuleSize()}</p>
 */
/* private static final */ class EstimatedModuleComparator {
    /** @override */
    compare(center1, center2) {
        return Float.compare(center1.getEstimatedModuleSize(), center2.getEstimatedModuleSize());
    }
}
/**
 * <p>This class attempts to find finder patterns in a QR Code. Finder patterns are the square
 * markers at three corners of a QR Code.</p>
 *
 * <p>This class is thread-safe but not reentrant. Each thread must allocate its own object.
 *
 * @author Sean Owen
 */
export default class FinderPatternFinder {
    /**
     * @param image image to search
     */
    constructor(image, resultPointCallback) {
        // TYPESCRIPTPORT: this contructor only serves as entrypoint for the original Java overloads
        if (resultPointCallback) {
            this.constructorOverload2(image, resultPointCallback);
            return;
        }
        this.constructorOverload1(image);
    }
    /**
     * <p>Creates a finder that will search the image for three finder patterns.</p>
     *
     * @param image image to search
     */
    constructorOverload1(image) {
        this.constructorOverload2(image, null);
    }
    /**
   * @param image image to search
   * @param resultPointCallback
   */
    constructorOverload2(image, resultPointCallback) {
        this.image = image;
        this.possibleCenters = new Array();
        this.crossCheckStateCount = Int32Array.from({ length: 5 });
        this.resultPointCallback = resultPointCallback;
    }
    getImage() {
        return this.image;
    }
    getPossibleCenters() {
        return this.possibleCenters;
    }
    /**
     *
     * @throws NotFoundException
     */
    /* final */ find(hints) {
        const tryHarder = hints != null && hints.has(DecodeHintType.TRY_HARDER);
        const maxI = this.image.getHeight();
        const maxJ = this.image.getWidth();
        // We are looking for black/white/black/white/black modules in
        // 1:1:3:1:1 ratio; this tracks the number of such modules seen so far
        // Let's assume that the maximum version QR Code we support takes up 1/4 the height of the
        // image, and then account for the center being 3 modules in size. This gives the smallest
        // number of pixels the center could be, so skip this often. When trying harder, look for all
        // QR versions regardless of how dense they are.
        let iSkip = Math.trunc((3 * maxI) / (4 * FinderPatternFinder.MAX_MODULES));
        if (iSkip < FinderPatternFinder.MIN_SKIP || tryHarder) {
            iSkip = FinderPatternFinder.MIN_SKIP;
        }
        let done = false;
        const stateCount = Int32Array.from({ length: 5 });
        for (let i = iSkip - 1; i < maxI && !done; i += iSkip) {
            // Get a row of black/white values
            this.clearCounts(stateCount);
            let currentState = 0;
            for (let j = 0; j < maxJ; j++) {
                if (this.image.get(j, i)) {
                    // Black pixel
                    if ((currentState & 1) === 1) { // Counting white pixels
                        currentState++;
                    }
                    stateCount[currentState]++;
                }
                else { // White pixel
                    if ((currentState & 1) === 0) { // Counting black pixels
                        if (currentState === 4) { // A winner?
                            if (FinderPatternFinder.foundPatternCross(stateCount)) { // Yes
                                let confirmed = this.handlePossibleCenter(stateCount, i, j);
                                if (confirmed) {
                                    // Start examining every other line. Checking each line turned out to be too
                                    // expensive and didn't improve performance.
                                    iSkip = 2;
                                    if (this.hasSkipped) {
                                        done = this.haveMultiplyConfirmedCenters();
                                    }
                                    else {
                                        let rowSkip = this.findRowSkip();
                                        if (rowSkip > stateCount[2]) {
                                            // Skip rows between row of lower confirmed center
                                            // and top of presumed third confirmed center
                                            // but back up a bit to get a full chance of detecting
                                            // it, entire width of center of finder pattern
                                            // Skip by rowSkip, but back off by stateCount[2] (size of last center
                                            // of pattern we saw) to be conservative, and also back off by iSkip which
                                            // is about to be re-added
                                            i += rowSkip - stateCount[2] - iSkip;
                                            j = maxJ - 1;
                                        }
                                    }
                                }
                                else {
                                    this.shiftCounts2(stateCount);
                                    currentState = 3;
                                    continue;
                                }
                                // Clear state to start looking again
                                currentState = 0;
                                this.clearCounts(stateCount);
                            }
                            else { // No, shift counts back by two
                                this.shiftCounts2(stateCount);
                                currentState = 3;
                            }
                        }
                        else {
                            stateCount[++currentState]++;
                        }
                    }
                    else { // Counting white pixels
                        stateCount[currentState]++;
                    }
                }
            }
            if (FinderPatternFinder.foundPatternCross(stateCount)) {
                let confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
                if (confirmed) {
                    iSkip = stateCount[0];
                    if (this.hasSkipped) {
                        // Found a third one
                        done = this.haveMultiplyConfirmedCenters();
                    }
                }
            }
        }
        const patternInfo = this.selectBestPatterns();
        ResultPoint.orderBestPatterns(patternInfo);
        return new FinderPatternInfo(patternInfo);
    }
    /**
     * Given a count of black/white/black/white/black pixels just seen and an end position,
     * figures the location of the center of this run.
     */
    static centerFromEnd(stateCount, end) {
        return (end - stateCount[4] - stateCount[3]) - stateCount[2] / 2.0;
    }
    /**
     * @param stateCount count of black/white/black/white/black pixels just read
     * @return true iff the proportions of the counts is close enough to the 1/1/3/1/1 ratios
     *         used by finder patterns to be considered a match
     */
    static foundPatternCross(stateCount) {
        let totalModuleSize = 0;
        for (let i = 0; i < 5; i++) {
            let count = stateCount[i];
            if (count === 0) {
                return false;
            }
            totalModuleSize += count;
        }
        if (totalModuleSize < 7) {
            return false;
        }
        const moduleSize = totalModuleSize / 7.0; // TYPESCRIPTPORT: check if a precision reduction is needed
        const maxVariance = moduleSize / 2.0; // TYPESCRIPTPORT: check if a precision reduction is needed
        // Allow less than 50% variance from 1-1-3-1-1 proportions
        return Math.abs(moduleSize - stateCount[0]) < maxVariance &&
            Math.abs(moduleSize - stateCount[1]) < maxVariance &&
            Math.abs(3.0 * moduleSize - stateCount[2]) < 3 * maxVariance &&
            Math.abs(moduleSize - stateCount[3]) < maxVariance &&
            Math.abs(moduleSize - stateCount[4]) < maxVariance;
    }
    /**
     * @param stateCount count of black/white/black/white/black pixels just read
     * @return true iff the proportions of the counts is close enough to the 1/1/3/1/1 ratios
     *         used by finder patterns to be considered a match
     */
    static foundPatternDiagonal(stateCount) {
        let totalModuleSize = 0;
        for (let i = 0; i < 5; i++) {
            const count = stateCount[i];
            if (count === 0) {
                return false;
            }
            totalModuleSize += count;
        }
        if (totalModuleSize < 7) {
            return false;
        }
        const moduleSize = totalModuleSize / 7.0;
        const maxVariance = moduleSize / 1.333;
        // Allow less than 75% variance from 1-1-3-1-1 proportions
        return Math.abs(moduleSize - stateCount[0]) < maxVariance &&
            Math.abs(moduleSize - stateCount[1]) < maxVariance &&
            Math.abs(3.0 * moduleSize - stateCount[2]) < 3 * maxVariance &&
            Math.abs(moduleSize - stateCount[3]) < maxVariance &&
            Math.abs(moduleSize - stateCount[4]) < maxVariance;
    }
    getCrossCheckStateCount() {
        this.clearCounts(this.crossCheckStateCount);
        return this.crossCheckStateCount;
    }
    clearCounts(counts) {
        Arrays.fill(counts, 0);
    }
    shiftCounts2(stateCount) {
        stateCount[0] = stateCount[2];
        stateCount[1] = stateCount[3];
        stateCount[2] = stateCount[4];
        stateCount[3] = 1;
        stateCount[4] = 0;
    }
    /**
     * After a vertical and horizontal scan finds a potential finder pattern, this method
     * "cross-cross-cross-checks" by scanning down diagonally through the center of the possible
     * finder pattern to see if the same proportion is detected.
     *
     * @param centerI row where a finder pattern was detected
     * @param centerJ center of the section that appears to cross a finder pattern
     * @return true if proportions are withing expected limits
     */
    crossCheckDiagonal(centerI, centerJ) {
        const stateCount = this.getCrossCheckStateCount();
        // Start counting up, left from center finding black center mass
        let i = 0;
        while (centerI >= i && centerJ >= i && this.image.get(centerJ - i, centerI - i)) {
            stateCount[2]++;
            i++;
        }
        if (stateCount[2] === 0) {
            return false;
        }
        // Continue up, left finding white space
        while (centerI >= i && centerJ >= i && !this.image.get(centerJ - i, centerI - i)) {
            stateCount[1]++;
            i++;
        }
        if (stateCount[1] === 0) {
            return false;
        }
        // Continue up, left finding black border
        while (centerI >= i && centerJ >= i && this.image.get(centerJ - i, centerI - i)) {
            stateCount[0]++;
            i++;
        }
        if (stateCount[0] === 0) {
            return false;
        }
        const maxI = this.image.getHeight();
        const maxJ = this.image.getWidth();
        // Now also count down, right from center
        i = 1;
        while (centerI + i < maxI && centerJ + i < maxJ && this.image.get(centerJ + i, centerI + i)) {
            stateCount[2]++;
            i++;
        }
        while (centerI + i < maxI && centerJ + i < maxJ && !this.image.get(centerJ + i, centerI + i)) {
            stateCount[3]++;
            i++;
        }
        if (stateCount[3] === 0) {
            return false;
        }
        while (centerI + i < maxI && centerJ + i < maxJ && this.image.get(centerJ + i, centerI + i)) {
            stateCount[4]++;
            i++;
        }
        if (stateCount[4] === 0) {
            return false;
        }
        return FinderPatternFinder.foundPatternDiagonal(stateCount);
    }
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
    crossCheckVertical(startI, centerJ, maxCount, originalStateCountTotal) {
        const image = this.image;
        const maxI = image.getHeight();
        let stateCount = this.getCrossCheckStateCount();
        // Start counting up from center
        let i = startI;
        while (i >= 0 && image.get(centerJ, i)) {
            stateCount[2]++;
            i--;
        }
        if (i < 0) {
            return Float.NaN;
        }
        while (i >= 0 && !image.get(centerJ, i) && stateCount[1] <= maxCount) {
            stateCount[1]++;
            i--;
        }
        // If already too many modules in this state or ran off the edge:
        if (i < 0 || stateCount[1] > maxCount) {
            return Float.NaN;
        }
        while (i >= 0 && image.get(centerJ, i) && stateCount[0] <= maxCount) {
            stateCount[0]++;
            i--;
        }
        if (stateCount[0] > maxCount) {
            return Float.NaN;
        }
        // Now also count down from center
        i = startI + 1;
        while (i < maxI && image.get(centerJ, i)) {
            stateCount[2]++;
            i++;
        }
        if (i === maxI) {
            return Float.NaN;
        }
        while (i < maxI && !image.get(centerJ, i) && stateCount[3] < maxCount) {
            stateCount[3]++;
            i++;
        }
        if (i === maxI || stateCount[3] >= maxCount) {
            return Float.NaN;
        }
        while (i < maxI && image.get(centerJ, i) && stateCount[4] < maxCount) {
            stateCount[4]++;
            i++;
        }
        if (stateCount[4] >= maxCount) {
            return Float.NaN;
        }
        // If we found a finder-pattern-like section, but its size is more than 40% different than
        // the original, assume it's a false positive
        const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] +
            stateCount[4];
        if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
            return Float.NaN;
        }
        return FinderPatternFinder.foundPatternCross(stateCount) ? FinderPatternFinder.centerFromEnd(stateCount, i) : Float.NaN;
    }
    /**
     * <p>Like {@link #crossCheckVertical(int, int, int, int)}, and in fact is basically identical,
     * except it reads horizontally instead of vertically. This is used to cross-cross
     * check a vertical cross check and locate the real center of the alignment pattern.</p>
     */
    crossCheckHorizontal(startJ, centerI, maxCount, originalStateCountTotal) {
        const image = this.image;
        const maxJ = image.getWidth();
        const stateCount = this.getCrossCheckStateCount();
        let j = startJ;
        while (j >= 0 && image.get(j, centerI)) {
            stateCount[2]++;
            j--;
        }
        if (j < 0) {
            return Float.NaN;
        }
        while (j >= 0 && !image.get(j, centerI) && stateCount[1] <= maxCount) {
            stateCount[1]++;
            j--;
        }
        if (j < 0 || stateCount[1] > maxCount) {
            return Float.NaN;
        }
        while (j >= 0 && image.get(j, centerI) && stateCount[0] <= maxCount) {
            stateCount[0]++;
            j--;
        }
        if (stateCount[0] > maxCount) {
            return Float.NaN;
        }
        j = startJ + 1;
        while (j < maxJ && image.get(j, centerI)) {
            stateCount[2]++;
            j++;
        }
        if (j === maxJ) {
            return Float.NaN;
        }
        while (j < maxJ && !image.get(j, centerI) && stateCount[3] < maxCount) {
            stateCount[3]++;
            j++;
        }
        if (j === maxJ || stateCount[3] >= maxCount) {
            return Float.NaN;
        }
        while (j < maxJ && image.get(j, centerI) && stateCount[4] < maxCount) {
            stateCount[4]++;
            j++;
        }
        if (stateCount[4] >= maxCount) {
            return Float.NaN;
        }
        // If we found a finder-pattern-like section, but its size is significantly different than
        // the original, assume it's a false positive
        const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] +
            stateCount[4];
        if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal) {
            return Float.NaN;
        }
        return FinderPatternFinder.foundPatternCross(stateCount) ? FinderPatternFinder.centerFromEnd(stateCount, j) : Float.NaN;
    }
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
    handlePossibleCenterX(stateCount, i, j, pureBarcode) {
        return this.handlePossibleCenter(stateCount, i, j);
    }
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
    handlePossibleCenter(stateCount, i, j) {
        const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] +
            stateCount[4];
        let centerJ = FinderPatternFinder.centerFromEnd(stateCount, j);
        const centerI = this.crossCheckVertical(i, centerJ, stateCount[2], stateCountTotal);
        if (!Float.isNaN(centerI)) {
            // Re-cross check
            centerJ = this.crossCheckHorizontal(Math.trunc(centerJ), Math.trunc(centerI), stateCount[2], stateCountTotal);
            if (!Float.isNaN(centerJ) && this.crossCheckDiagonal(Math.trunc(centerI), Math.trunc(centerJ))) {
                const estimatedModuleSize = stateCountTotal / 7.0;
                let found = false;
                for (let index = 0; index < this.possibleCenters.length; index++) {
                    const center = this.possibleCenters[index];
                    // Look for about the same center and module size:
                    if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
                        this.possibleCenters[index] = center.combineEstimate(centerI, centerJ, estimatedModuleSize);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    const point = new FinderPattern(centerJ, centerI, estimatedModuleSize);
                    this.possibleCenters.push(point);
                    if (this.resultPointCallback != null) {
                        this.resultPointCallback.foundPossibleResultPoint(point);
                    }
                }
                return true;
            }
        }
        return false;
    }
    /**
     * @return number of rows we could safely skip during scanning, based on the first
     *         two finder patterns that have been located. In some cases their position will
     *         allow us to infer that the third pattern must lie below a certain point farther
     *         down in the image.
     */
    findRowSkip() {
        const max = this.possibleCenters.length;
        if (max <= 1) {
            return 0;
        }
        let firstConfirmedCenter = null;
        for (const center /*: FinderPattern*/ of this.possibleCenters) {
            if (center.getCount() >= FinderPatternFinder.CENTER_QUORUM) {
                if (firstConfirmedCenter == null) {
                    firstConfirmedCenter = center;
                }
                else {
                    // We have two confirmed centers
                    // How far down can we skip before resuming looking for the next
                    // pattern? In the worst case, only the difference between the
                    // difference in the x / y coordinates of the two centers.
                    // This is the case where you find top left last.
                    this.hasSkipped = true;
                    return Math.trunc((Math.abs(firstConfirmedCenter.getX() - center.getX()) -
                        Math.abs(firstConfirmedCenter.getY() - center.getY())) / 2);
                }
            }
        }
        return 0;
    }
    /**
     * @return true iff we have found at least 3 finder patterns that have been detected
     *         at least {@link #CENTER_QUORUM} times each, and, the estimated module size of the
     *         candidates is "pretty similar"
     */
    haveMultiplyConfirmedCenters() {
        let confirmedCount = 0;
        let totalModuleSize = 0.0;
        const max = this.possibleCenters.length;
        for (const pattern /*: FinderPattern*/ of this.possibleCenters) {
            if (pattern.getCount() >= FinderPatternFinder.CENTER_QUORUM) {
                confirmedCount++;
                totalModuleSize += pattern.getEstimatedModuleSize();
            }
        }
        if (confirmedCount < 3) {
            return false;
        }
        // OK, we have at least 3 confirmed centers, but, it's possible that one is a "false positive"
        // and that we need to keep looking. We detect this by asking if the estimated module sizes
        // vary too much. We arbitrarily say that when the total deviation from average exceeds
        // 5% of the total module size estimates, it's too much.
        const average = totalModuleSize / max;
        let totalDeviation = 0.0;
        for (const pattern /*: FinderPattern*/ of this.possibleCenters) {
            totalDeviation += Math.abs(pattern.getEstimatedModuleSize() - average);
        }
        return totalDeviation <= 0.05 * totalModuleSize;
    }
    /**
     * Get square of distance between a and b.
     */
    static squaredDistance(a, b) {
        const x = a.getX() - b.getX();
        const y = a.getY() - b.getY();
        return x * x + y * y;
    }
    /**
     * @return the 3 best {@link FinderPattern}s from our list of candidates. The "best" are
     *         those have similar module size and form a shape closer to a isosceles right triangle.
     * @throws {@link NotFoundException} if 3 such finder patterns do not exist
     */
    selectBestPatterns() {
        const startSize = this.possibleCenters.length;
        if (startSize < 3) {
            // Couldn't find enough finder patterns
            throw NotFoundException.getNotFoundInstance();
        }
        this.possibleCenters.sort(FinderPatternFinder.moduleComparator.compare);
        let distortion = Double.MAX_VALUE;
        const squares = Float64Array.from({ length: 3 });
        const bestPatterns = new FinderPattern[3];
        for (let i /*int*/ = 0; i < this.possibleCenters.length - 2; i++) {
            const fpi = this.possibleCenters[i];
            const minModuleSize = fpi.getEstimatedModuleSize();
            for (let j /*int*/ = i + 1; j < this.possibleCenters.length - 1; j++) {
                const fpj = this.possibleCenters[j];
                const squares0 = FinderPatternFinder.squaredDistance(fpi, fpj);
                for (let k /*int*/ = j + 1; k < this.possibleCenters.length; k++) {
                    const fpk = this.possibleCenters[k];
                    const maxModuleSize = fpk.getEstimatedModuleSize();
                    if (maxModuleSize > minModuleSize * 1.4) {
                        // module size is not similar
                        continue;
                    }
                    squares[0] = squares0;
                    squares[1] = FinderPatternFinder.squaredDistance(fpj, fpk);
                    squares[2] = FinderPatternFinder.squaredDistance(fpi, fpk);
                    Arrays.sort(squares);
                    // a^2 + b^2 = c^2 (Pythagorean theorem), and a = b (isosceles triangle).
                    // Since any right triangle satisfies the formula c^2 - b^2 - a^2 = 0,
                    // we need to check both two equal sides separately.
                    // The value of |c^2 - 2 * b^2| + |c^2 - 2 * a^2| increases as dissimilarity
                    // from isosceles right triangle.
                    const d = Math.abs(squares[2] - 2 * squares[1]) + Math.abs(squares[2] - 2 * squares[0]);
                    if (d < distortion) {
                        distortion = d;
                        bestPatterns[0] = fpi;
                        bestPatterns[1] = fpj;
                        bestPatterns[2] = fpk;
                    }
                }
            }
        }
        if (distortion === Double.MAX_VALUE) {
            throw NotFoundException.getNotFoundInstance();
        }
        return bestPatterns;
    }
}
FinderPatternFinder.CENTER_QUORUM = 2;
FinderPatternFinder.moduleComparator = new EstimatedModuleComparator();
FinderPatternFinder.MIN_SKIP = 3; // 1 pixel/module times 3 modules/center
FinderPatternFinder.MAX_MODULES = 97; // support up to version 20 for mobile clients
//# sourceMappingURL=FinderPatternFinder.js.map