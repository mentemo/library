"use strict";
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var DecodeHintType_1 = require("../../DecodeHintType");
var NotFoundException_1 = require("../../NotFoundException");
var ResultPoint_1 = require("../../ResultPoint");
var Arrays_1 = require("../../util/Arrays");
var Double_1 = require("../../util/Double");
var Float_1 = require("../../util/Float");
var FinderPattern_1 = require("./FinderPattern");
var FinderPatternInfo_1 = require("./FinderPatternInfo");
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
/* private static final */ var EstimatedModuleComparator = /** @class */ (function () {
    function EstimatedModuleComparator() {
    }
    /** @override */
    EstimatedModuleComparator.prototype.compare = function (center1, center2) {
        return Float_1.default.compare(center1.getEstimatedModuleSize(), center2.getEstimatedModuleSize());
    };
    return EstimatedModuleComparator;
}());
/**
 * <p>This class attempts to find finder patterns in a QR Code. Finder patterns are the square
 * markers at three corners of a QR Code.</p>
 *
 * <p>This class is thread-safe but not reentrant. Each thread must allocate its own object.
 *
 * @author Sean Owen
 */
var FinderPatternFinder = /** @class */ (function () {
    /**
     * @param image image to search
     */
    function FinderPatternFinder(image, resultPointCallback) {
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
    FinderPatternFinder.prototype.constructorOverload1 = function (image) {
        this.constructorOverload2(image, null);
    };
    /**
   * @param image image to search
   * @param resultPointCallback
   */
    FinderPatternFinder.prototype.constructorOverload2 = function (image, resultPointCallback) {
        this.image = image;
        this.possibleCenters = new Array();
        this.crossCheckStateCount = Int32Array.from({ length: 5 });
        this.resultPointCallback = resultPointCallback;
    };
    FinderPatternFinder.prototype.getImage = function () {
        return this.image;
    };
    FinderPatternFinder.prototype.getPossibleCenters = function () {
        return this.possibleCenters;
    };
    /**
     *
     * @throws NotFoundException
     */
    /* final */ FinderPatternFinder.prototype.find = function (hints) {
        var tryHarder = hints != null && hints.has(DecodeHintType_1.default.TRY_HARDER);
        var maxI = this.image.getHeight();
        var maxJ = this.image.getWidth();
        // We are looking for black/white/black/white/black modules in
        // 1:1:3:1:1 ratio; this tracks the number of such modules seen so far
        // Let's assume that the maximum version QR Code we support takes up 1/4 the height of the
        // image, and then account for the center being 3 modules in size. This gives the smallest
        // number of pixels the center could be, so skip this often. When trying harder, look for all
        // QR versions regardless of how dense they are.
        var iSkip = Math.trunc((3 * maxI) / (4 * FinderPatternFinder.MAX_MODULES));
        if (iSkip < FinderPatternFinder.MIN_SKIP || tryHarder) {
            iSkip = FinderPatternFinder.MIN_SKIP;
        }
        var done = false;
        var stateCount = Int32Array.from({ length: 5 });
        for (var i = iSkip - 1; i < maxI && !done; i += iSkip) {
            // Get a row of black/white values
            this.clearCounts(stateCount);
            var currentState = 0;
            for (var j = 0; j < maxJ; j++) {
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
                                var confirmed = this.handlePossibleCenter(stateCount, i, j);
                                if (confirmed) {
                                    // Start examining every other line. Checking each line turned out to be too
                                    // expensive and didn't improve performance.
                                    iSkip = 2;
                                    if (this.hasSkipped) {
                                        done = this.haveMultiplyConfirmedCenters();
                                    }
                                    else {
                                        var rowSkip = this.findRowSkip();
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
                var confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
                if (confirmed) {
                    iSkip = stateCount[0];
                    if (this.hasSkipped) {
                        // Found a third one
                        done = this.haveMultiplyConfirmedCenters();
                    }
                }
            }
        }
        var patternInfo = this.selectBestPatterns();
        ResultPoint_1.default.orderBestPatterns(patternInfo);
        return new FinderPatternInfo_1.default(patternInfo);
    };
    /**
     * Given a count of black/white/black/white/black pixels just seen and an end position,
     * figures the location of the center of this run.
     */
    FinderPatternFinder.centerFromEnd = function (stateCount, end) {
        return (end - stateCount[4] - stateCount[3]) - stateCount[2] / 2.0;
    };
    /**
     * @param stateCount count of black/white/black/white/black pixels just read
     * @return true iff the proportions of the counts is close enough to the 1/1/3/1/1 ratios
     *         used by finder patterns to be considered a match
     */
    FinderPatternFinder.foundPatternCross = function (stateCount) {
        var totalModuleSize = 0;
        for (var i = 0; i < 5; i++) {
            var count = stateCount[i];
            if (count === 0) {
                return false;
            }
            totalModuleSize += count;
        }
        if (totalModuleSize < 7) {
            return false;
        }
        var moduleSize = totalModuleSize / 7.0; // TYPESCRIPTPORT: check if a precision reduction is needed
        var maxVariance = moduleSize / 2.0; // TYPESCRIPTPORT: check if a precision reduction is needed
        // Allow less than 50% variance from 1-1-3-1-1 proportions
        return Math.abs(moduleSize - stateCount[0]) < maxVariance &&
            Math.abs(moduleSize - stateCount[1]) < maxVariance &&
            Math.abs(3.0 * moduleSize - stateCount[2]) < 3 * maxVariance &&
            Math.abs(moduleSize - stateCount[3]) < maxVariance &&
            Math.abs(moduleSize - stateCount[4]) < maxVariance;
    };
    /**
     * @param stateCount count of black/white/black/white/black pixels just read
     * @return true iff the proportions of the counts is close enough to the 1/1/3/1/1 ratios
     *         used by finder patterns to be considered a match
     */
    FinderPatternFinder.foundPatternDiagonal = function (stateCount) {
        var totalModuleSize = 0;
        for (var i = 0; i < 5; i++) {
            var count = stateCount[i];
            if (count === 0) {
                return false;
            }
            totalModuleSize += count;
        }
        if (totalModuleSize < 7) {
            return false;
        }
        var moduleSize = totalModuleSize / 7.0;
        var maxVariance = moduleSize / 1.333;
        // Allow less than 75% variance from 1-1-3-1-1 proportions
        return Math.abs(moduleSize - stateCount[0]) < maxVariance &&
            Math.abs(moduleSize - stateCount[1]) < maxVariance &&
            Math.abs(3.0 * moduleSize - stateCount[2]) < 3 * maxVariance &&
            Math.abs(moduleSize - stateCount[3]) < maxVariance &&
            Math.abs(moduleSize - stateCount[4]) < maxVariance;
    };
    FinderPatternFinder.prototype.getCrossCheckStateCount = function () {
        this.clearCounts(this.crossCheckStateCount);
        return this.crossCheckStateCount;
    };
    FinderPatternFinder.prototype.clearCounts = function (counts) {
        Arrays_1.default.fill(counts, 0);
    };
    FinderPatternFinder.prototype.shiftCounts2 = function (stateCount) {
        stateCount[0] = stateCount[2];
        stateCount[1] = stateCount[3];
        stateCount[2] = stateCount[4];
        stateCount[3] = 1;
        stateCount[4] = 0;
    };
    /**
     * After a vertical and horizontal scan finds a potential finder pattern, this method
     * "cross-cross-cross-checks" by scanning down diagonally through the center of the possible
     * finder pattern to see if the same proportion is detected.
     *
     * @param centerI row where a finder pattern was detected
     * @param centerJ center of the section that appears to cross a finder pattern
     * @return true if proportions are withing expected limits
     */
    FinderPatternFinder.prototype.crossCheckDiagonal = function (centerI, centerJ) {
        var stateCount = this.getCrossCheckStateCount();
        // Start counting up, left from center finding black center mass
        var i = 0;
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
        var maxI = this.image.getHeight();
        var maxJ = this.image.getWidth();
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
    };
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
    FinderPatternFinder.prototype.crossCheckVertical = function (startI, centerJ, maxCount, originalStateCountTotal) {
        var image = this.image;
        var maxI = image.getHeight();
        var stateCount = this.getCrossCheckStateCount();
        // Start counting up from center
        var i = startI;
        while (i >= 0 && image.get(centerJ, i)) {
            stateCount[2]++;
            i--;
        }
        if (i < 0) {
            return Float_1.default.NaN;
        }
        while (i >= 0 && !image.get(centerJ, i) && stateCount[1] <= maxCount) {
            stateCount[1]++;
            i--;
        }
        // If already too many modules in this state or ran off the edge:
        if (i < 0 || stateCount[1] > maxCount) {
            return Float_1.default.NaN;
        }
        while (i >= 0 && image.get(centerJ, i) && stateCount[0] <= maxCount) {
            stateCount[0]++;
            i--;
        }
        if (stateCount[0] > maxCount) {
            return Float_1.default.NaN;
        }
        // Now also count down from center
        i = startI + 1;
        while (i < maxI && image.get(centerJ, i)) {
            stateCount[2]++;
            i++;
        }
        if (i === maxI) {
            return Float_1.default.NaN;
        }
        while (i < maxI && !image.get(centerJ, i) && stateCount[3] < maxCount) {
            stateCount[3]++;
            i++;
        }
        if (i === maxI || stateCount[3] >= maxCount) {
            return Float_1.default.NaN;
        }
        while (i < maxI && image.get(centerJ, i) && stateCount[4] < maxCount) {
            stateCount[4]++;
            i++;
        }
        if (stateCount[4] >= maxCount) {
            return Float_1.default.NaN;
        }
        // If we found a finder-pattern-like section, but its size is more than 40% different than
        // the original, assume it's a false positive
        var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] +
            stateCount[4];
        if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
            return Float_1.default.NaN;
        }
        return FinderPatternFinder.foundPatternCross(stateCount) ? FinderPatternFinder.centerFromEnd(stateCount, i) : Float_1.default.NaN;
    };
    /**
     * <p>Like {@link #crossCheckVertical(int, int, int, int)}, and in fact is basically identical,
     * except it reads horizontally instead of vertically. This is used to cross-cross
     * check a vertical cross check and locate the real center of the alignment pattern.</p>
     */
    FinderPatternFinder.prototype.crossCheckHorizontal = function (startJ, centerI, maxCount, originalStateCountTotal) {
        var image = this.image;
        var maxJ = image.getWidth();
        var stateCount = this.getCrossCheckStateCount();
        var j = startJ;
        while (j >= 0 && image.get(j, centerI)) {
            stateCount[2]++;
            j--;
        }
        if (j < 0) {
            return Float_1.default.NaN;
        }
        while (j >= 0 && !image.get(j, centerI) && stateCount[1] <= maxCount) {
            stateCount[1]++;
            j--;
        }
        if (j < 0 || stateCount[1] > maxCount) {
            return Float_1.default.NaN;
        }
        while (j >= 0 && image.get(j, centerI) && stateCount[0] <= maxCount) {
            stateCount[0]++;
            j--;
        }
        if (stateCount[0] > maxCount) {
            return Float_1.default.NaN;
        }
        j = startJ + 1;
        while (j < maxJ && image.get(j, centerI)) {
            stateCount[2]++;
            j++;
        }
        if (j === maxJ) {
            return Float_1.default.NaN;
        }
        while (j < maxJ && !image.get(j, centerI) && stateCount[3] < maxCount) {
            stateCount[3]++;
            j++;
        }
        if (j === maxJ || stateCount[3] >= maxCount) {
            return Float_1.default.NaN;
        }
        while (j < maxJ && image.get(j, centerI) && stateCount[4] < maxCount) {
            stateCount[4]++;
            j++;
        }
        if (stateCount[4] >= maxCount) {
            return Float_1.default.NaN;
        }
        // If we found a finder-pattern-like section, but its size is significantly different than
        // the original, assume it's a false positive
        var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] +
            stateCount[4];
        if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal) {
            return Float_1.default.NaN;
        }
        return FinderPatternFinder.foundPatternCross(stateCount) ? FinderPatternFinder.centerFromEnd(stateCount, j) : Float_1.default.NaN;
    };
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
    FinderPatternFinder.prototype.handlePossibleCenterX = function (stateCount, i, j, pureBarcode) {
        return this.handlePossibleCenter(stateCount, i, j);
    };
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
    FinderPatternFinder.prototype.handlePossibleCenter = function (stateCount, i, j) {
        var stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] +
            stateCount[4];
        var centerJ = FinderPatternFinder.centerFromEnd(stateCount, j);
        var centerI = this.crossCheckVertical(i, centerJ, stateCount[2], stateCountTotal);
        if (!Float_1.default.isNaN(centerI)) {
            // Re-cross check
            centerJ = this.crossCheckHorizontal(Math.trunc(centerJ), Math.trunc(centerI), stateCount[2], stateCountTotal);
            if (!Float_1.default.isNaN(centerJ) && this.crossCheckDiagonal(Math.trunc(centerI), Math.trunc(centerJ))) {
                var estimatedModuleSize = stateCountTotal / 7.0;
                var found = false;
                for (var index = 0; index < this.possibleCenters.length; index++) {
                    var center = this.possibleCenters[index];
                    // Look for about the same center and module size:
                    if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
                        this.possibleCenters[index] = center.combineEstimate(centerI, centerJ, estimatedModuleSize);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    var point = new FinderPattern_1.default(centerJ, centerI, estimatedModuleSize);
                    this.possibleCenters.push(point);
                    if (this.resultPointCallback != null) {
                        this.resultPointCallback.foundPossibleResultPoint(point);
                    }
                }
                return true;
            }
        }
        return false;
    };
    /**
     * @return number of rows we could safely skip during scanning, based on the first
     *         two finder patterns that have been located. In some cases their position will
     *         allow us to infer that the third pattern must lie below a certain point farther
     *         down in the image.
     */
    FinderPatternFinder.prototype.findRowSkip = function () {
        var e_1, _a;
        var max = this.possibleCenters.length;
        if (max <= 1) {
            return 0;
        }
        var firstConfirmedCenter = null;
        try {
            for (var _b = __values(this.possibleCenters), _c = _b.next(); !_c.done; _c = _b.next()) {
                var center = _c.value /*: FinderPattern*/;
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
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return 0;
    };
    /**
     * @return true iff we have found at least 3 finder patterns that have been detected
     *         at least {@link #CENTER_QUORUM} times each, and, the estimated module size of the
     *         candidates is "pretty similar"
     */
    FinderPatternFinder.prototype.haveMultiplyConfirmedCenters = function () {
        var e_2, _a, e_3, _b;
        var confirmedCount = 0;
        var totalModuleSize = 0.0;
        var max = this.possibleCenters.length;
        try {
            for (var _c = __values(this.possibleCenters), _d = _c.next(); !_d.done; _d = _c.next()) {
                var pattern = _d.value /*: FinderPattern*/;
                if (pattern.getCount() >= FinderPatternFinder.CENTER_QUORUM) {
                    confirmedCount++;
                    totalModuleSize += pattern.getEstimatedModuleSize();
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (confirmedCount < 3) {
            return false;
        }
        // OK, we have at least 3 confirmed centers, but, it's possible that one is a "false positive"
        // and that we need to keep looking. We detect this by asking if the estimated module sizes
        // vary too much. We arbitrarily say that when the total deviation from average exceeds
        // 5% of the total module size estimates, it's too much.
        var average = totalModuleSize / max;
        var totalDeviation = 0.0;
        try {
            for (var _e = __values(this.possibleCenters), _f = _e.next(); !_f.done; _f = _e.next()) {
                var pattern = _f.value /*: FinderPattern*/;
                totalDeviation += Math.abs(pattern.getEstimatedModuleSize() - average);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return totalDeviation <= 0.05 * totalModuleSize;
    };
    /**
     * Get square of distance between a and b.
     */
    FinderPatternFinder.squaredDistance = function (a, b) {
        var x = a.getX() - b.getX();
        var y = a.getY() - b.getY();
        return x * x + y * y;
    };
    /**
     * @return the 3 best {@link FinderPattern}s from our list of candidates. The "best" are
     *         those have similar module size and form a shape closer to a isosceles right triangle.
     * @throws {@link NotFoundException} if 3 such finder patterns do not exist
     */
    FinderPatternFinder.prototype.selectBestPatterns = function () {
        var startSize = this.possibleCenters.length;
        if (startSize < 3) {
            // Couldn't find enough finder patterns
            throw NotFoundException_1.default.getNotFoundInstance();
        }
        this.possibleCenters.sort(FinderPatternFinder.moduleComparator.compare);
        var distortion = Double_1.default.MAX_VALUE;
        var squares = Float64Array.from({ length: 3 });
        var bestPatterns = new FinderPattern_1.default[3];
        for (var i /*int*/ = 0; i < this.possibleCenters.length - 2; i++) {
            var fpi = this.possibleCenters[i];
            var minModuleSize = fpi.getEstimatedModuleSize();
            for (var j /*int*/ = i + 1; j < this.possibleCenters.length - 1; j++) {
                var fpj = this.possibleCenters[j];
                var squares0 = FinderPatternFinder.squaredDistance(fpi, fpj);
                for (var k /*int*/ = j + 1; k < this.possibleCenters.length; k++) {
                    var fpk = this.possibleCenters[k];
                    var maxModuleSize = fpk.getEstimatedModuleSize();
                    if (maxModuleSize > minModuleSize * 1.4) {
                        // module size is not similar
                        continue;
                    }
                    squares[0] = squares0;
                    squares[1] = FinderPatternFinder.squaredDistance(fpj, fpk);
                    squares[2] = FinderPatternFinder.squaredDistance(fpi, fpk);
                    Arrays_1.default.sort(squares);
                    // a^2 + b^2 = c^2 (Pythagorean theorem), and a = b (isosceles triangle).
                    // Since any right triangle satisfies the formula c^2 - b^2 - a^2 = 0,
                    // we need to check both two equal sides separately.
                    // The value of |c^2 - 2 * b^2| + |c^2 - 2 * a^2| increases as dissimilarity
                    // from isosceles right triangle.
                    var d = Math.abs(squares[2] - 2 * squares[1]) + Math.abs(squares[2] - 2 * squares[0]);
                    if (d < distortion) {
                        distortion = d;
                        bestPatterns[0] = fpi;
                        bestPatterns[1] = fpj;
                        bestPatterns[2] = fpk;
                    }
                }
            }
        }
        if (distortion === Double_1.default.MAX_VALUE) {
            throw NotFoundException_1.default.getNotFoundInstance();
        }
        return bestPatterns;
    };
    FinderPatternFinder.CENTER_QUORUM = 2;
    FinderPatternFinder.moduleComparator = new EstimatedModuleComparator();
    FinderPatternFinder.MIN_SKIP = 3; // 1 pixel/module times 3 modules/center
    FinderPatternFinder.MAX_MODULES = 97; // support up to version 20 for mobile clients
    return FinderPatternFinder;
}());
exports.default = FinderPatternFinder;
//# sourceMappingURL=FinderPatternFinder.js.map