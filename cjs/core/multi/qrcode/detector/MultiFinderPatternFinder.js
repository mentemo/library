"use strict";
/*
 * Copyright 2009 ZXing authors
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var DecodeHintType_1 = require("../../../DecodeHintType");
var NotFoundException_1 = require("../../../NotFoundException");
var FinderPatternFinder_1 = require("../../../qrcode/detector/FinderPatternFinder");
var FinderPatternInfo_1 = require("../../../qrcode/detector/FinderPatternInfo");
var ResultPoint_1 = require("../../../ResultPoint");
var Collections_1 = require("../../../util/Collections");
// package com.google.zxing.multi.qrcode.detector;
// import com.google.zxing.DecodeHintType;
// import com.google.zxing.NotFoundException;
// import com.google.zxing.ResultPoint;
// import com.google.zxing.ResultPointCallback;
// import com.google.zxing.common.BitMatrix;
// import com.google.zxing.qrcode.detector.FinderPattern;
// import com.google.zxing.qrcode.detector.FinderPatternFinder;
// import com.google.zxing.qrcode.detector.FinderPatternInfo;
// import java.io.Serializable;
// import java.util.ArrayList;
// import java.util.Collections;
// import java.util.Comparator;
// import java.util.List;
// import java.util.Map;
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
var MultiFinderPatternFinder = /** @class */ (function (_super) {
    __extends(MultiFinderPatternFinder, _super);
    function MultiFinderPatternFinder(image, resultPointCallback) {
        return _super.call(this, image, resultPointCallback) || this;
    }
    /**
     * @return the 3 best {@link FinderPattern}s from our list of candidates. The "best" are
     *         those that have been detected at least 2 times, and whose module
     *         size differs from the average among those patterns the least
     * @throws NotFoundException if 3 such finder patterns do not exist
     */
    MultiFinderPatternFinder.prototype.selectMultipleBestPatterns = function () {
        var possibleCenters = this.getPossibleCenters();
        var size = possibleCenters.length;
        if (size < 3) {
            // Couldn't find enough finder patterns
            throw NotFoundException_1.default.getNotFoundInstance();
        }
        /*
         * Begin HE modifications to safely detect multiple codes of equal size
         */
        if (size === 3) {
            return [possibleCenters];
        }
        // Sort by estimated module size to speed up the upcoming checks
        Collections_1.default.sort(possibleCenters, new ModuleSizeComparator());
        /*
         * Now lets start: build a list of tuples of three finder locations that
         *  - feature similar module sizes
         *  - are placed in a distance so the estimated module count is within the QR specification
         *  - have similar distance between upper left/right and left top/bottom finder patterns
         *  - form a triangle with 90° angle (checked by comparing top right/bottom left distance
         *    with pythagoras)
         *
         * Note: we allow each point to be used for more than one code region: this might seem
         * counterintuitive at first, but the performance penalty is not that big. At this point,
         * we cannot make a good quality decision whether the three finders actually represent
         * a QR code, or are just by chance laid out so it looks like there might be a QR code there.
         * So, if the layout seems right, lets have the decoder try to decode.
         */
        var results = new Array(); // holder for the results
        for (var i1 = 0; i1 < (size - 2); i1++) {
            var p1 = possibleCenters[i1];
            if (p1 == null) {
                continue;
            }
            for (var i2 = i1 + 1; i2 < (size - 1); i2++) {
                var p2 = possibleCenters[i2];
                if (p2 == null) {
                    continue;
                }
                // Compare the expected module sizes; if they are really off, skip
                var vModSize12 = (p1.getEstimatedModuleSize() - p2.getEstimatedModuleSize()) /
                    Math.min(p1.getEstimatedModuleSize(), p2.getEstimatedModuleSize());
                var vModSize12A = Math.abs(p1.getEstimatedModuleSize() - p2.getEstimatedModuleSize());
                if (vModSize12A > MultiFinderPatternFinder.DIFF_MODSIZE_CUTOFF && vModSize12 >= MultiFinderPatternFinder.DIFF_MODSIZE_CUTOFF_PERCENT) {
                    // break, since elements are ordered by the module size deviation there cannot be
                    // any more interesting elements for the given p1.
                    break;
                }
                for (var i3 = i2 + 1; i3 < size; i3++) {
                    var p3 = possibleCenters[i3];
                    if (p3 == null) {
                        continue;
                    }
                    // Compare the expected module sizes; if they are really off, skip
                    var vModSize23 = (p2.getEstimatedModuleSize() - p3.getEstimatedModuleSize()) /
                        Math.min(p2.getEstimatedModuleSize(), p3.getEstimatedModuleSize());
                    var vModSize23A = Math.abs(p2.getEstimatedModuleSize() - p3.getEstimatedModuleSize());
                    if (vModSize23A > MultiFinderPatternFinder.DIFF_MODSIZE_CUTOFF && vModSize23 >= MultiFinderPatternFinder.DIFF_MODSIZE_CUTOFF_PERCENT) {
                        // break, since elements are ordered by the module size deviation there cannot be
                        // any more interesting elements for the given p1.
                        break;
                    }
                    var test_1 = [p1, p2, p3];
                    ResultPoint_1.default.orderBestPatterns(test_1);
                    // Calculate the distances: a = topleft-bottomleft, b=topleft-topright, c = diagonal
                    var info = new FinderPatternInfo_1.default(test_1);
                    var dA = ResultPoint_1.default.distance(info.getTopLeft(), info.getBottomLeft());
                    var dC = ResultPoint_1.default.distance(info.getTopRight(), info.getBottomLeft());
                    var dB = ResultPoint_1.default.distance(info.getTopLeft(), info.getTopRight());
                    // Check the sizes
                    var estimatedModuleCount = (dA + dB) / (p1.getEstimatedModuleSize() * 2.0);
                    if (estimatedModuleCount > MultiFinderPatternFinder.MAX_MODULE_COUNT_PER_EDGE ||
                        estimatedModuleCount < MultiFinderPatternFinder.MIN_MODULE_COUNT_PER_EDGE) {
                        continue;
                    }
                    // Calculate the difference of the edge lengths in percent
                    var vABBC = Math.abs((dA - dB) / Math.min(dA, dB));
                    if (vABBC >= 0.1) {
                        continue;
                    }
                    // Calculate the diagonal length by assuming a 90° angle at topleft
                    var dCpy = Math.sqrt(dA * dA + dB * dB);
                    // Compare to the real distance in %
                    var vPyC = Math.abs((dC - dCpy) / Math.min(dC, dCpy));
                    if (vPyC >= 0.1) {
                        continue;
                    }
                    // All tests passed!
                    results.push(test_1);
                }
            }
        }
        if (results.length > 0) {
            return results /* .toArray(MultiFinderPatternFinder.EMPTY_FP_2D_ARRAY) */;
        }
        // Nothing found!
        throw NotFoundException_1.default.getNotFoundInstance();
    };
    /**
     * @throws NotFoundException
     */
    MultiFinderPatternFinder.prototype.findMulti = function (hints) {
        var e_1, _a;
        var tryHarder = hints != null && hints.has(DecodeHintType_1.default.TRY_HARDER);
        var image = this.getImage();
        var maxI = image.getHeight();
        var maxJ = image.getWidth();
        // We are looking for black/white/black/white/black modules in
        // 1:1:3:1:1 ratio; this tracks the number of such modules seen so far
        // Let's assume that the maximum version QR Code we support takes up 1/4 the height of the
        // image, and then account for the center being 3 modules in size. This gives the smallest
        // number of pixels the center could be, so skip this often. When trying harder, look for all
        // QR versions regardless of how dense they are.
        var iSkip = Math.trunc((3 * maxI) / (4 * MultiFinderPatternFinder.MAX_MODULES)); // TYPESCRIPTPORT: Java integer divisions always discard decimal chars.
        if (iSkip < MultiFinderPatternFinder.MIN_SKIP || tryHarder) {
            iSkip = MultiFinderPatternFinder.MIN_SKIP;
        }
        var stateCount = Int32Array.from({ length: 5 });
        for (var i = iSkip - 1; i < maxI; i += iSkip) {
            // Get a row of black/white values
            this.clearCounts(stateCount);
            var currentState = 0;
            for (var j = 0; j < maxJ; j++) {
                if (image.get(j, i)) {
                    // Black pixel
                    if ((currentState & 1) === 1) { // Counting white pixels
                        currentState++;
                    }
                    stateCount[currentState]++;
                }
                else { // White pixel
                    if ((currentState & 1) === 0) { // Counting black pixels
                        if (currentState === 4) { // A winner?
                            if (MultiFinderPatternFinder.foundPatternCross(stateCount) && this.handlePossibleCenter(stateCount, i, j)) { // Yes
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
            } // for j=...
            if (MultiFinderPatternFinder.foundPatternCross(stateCount)) {
                this.handlePossibleCenter(stateCount, i, maxJ);
            }
        } // for i=iSkip-1 ...
        var patternInfo = this.selectMultipleBestPatterns();
        var result = new Array();
        try {
            for (var patternInfo_1 = __values(patternInfo), patternInfo_1_1 = patternInfo_1.next(); !patternInfo_1_1.done; patternInfo_1_1 = patternInfo_1.next()) {
                var pattern = patternInfo_1_1.value;
                ResultPoint_1.default.orderBestPatterns(pattern);
                result.push(new FinderPatternInfo_1.default(pattern));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (patternInfo_1_1 && !patternInfo_1_1.done && (_a = patternInfo_1.return)) _a.call(patternInfo_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (result.length === 0) {
            return MultiFinderPatternFinder.EMPTY_RESULT_ARRAY;
        }
        else {
            return result /* .toArray(MultiFinderPatternFinder.EMPTY_RESULT_ARRAY) */;
        }
    };
    MultiFinderPatternFinder.EMPTY_RESULT_ARRAY = [];
    MultiFinderPatternFinder.EMPTY_FP_ARRAY = [];
    MultiFinderPatternFinder.EMPTY_FP_2D_ARRAY = [[]];
    // TODO MIN_MODULE_COUNT and MAX_MODULE_COUNT would be great hints to ask the user for
    // since it limits the number of regions to decode
    // max. legal count of modules per QR code edge (177)
    MultiFinderPatternFinder.MAX_MODULE_COUNT_PER_EDGE = 180;
    // min. legal count per modules per QR code edge (11)
    MultiFinderPatternFinder.MIN_MODULE_COUNT_PER_EDGE = 9;
    /**
     * More or less arbitrary cutoff point for determining if two finder patterns might belong
     * to the same code if they differ less than DIFF_MODSIZE_CUTOFF_PERCENT percent in their
     * estimated modules sizes.
     */
    MultiFinderPatternFinder.DIFF_MODSIZE_CUTOFF_PERCENT = 0.05;
    /**
     * More or less arbitrary cutoff point for determining if two finder patterns might belong
     * to the same code if they differ less than DIFF_MODSIZE_CUTOFF pixels/module in their
     * estimated modules sizes.
     */
    MultiFinderPatternFinder.DIFF_MODSIZE_CUTOFF = 0.5;
    return MultiFinderPatternFinder;
}(FinderPatternFinder_1.default));
exports.default = MultiFinderPatternFinder;
/**
 * A comparator that orders FinderPatterns by their estimated module size.
 */
/* private static final */ var ModuleSizeComparator = /** @class */ (function () {
    function ModuleSizeComparator() {
    }
    /** @override */
    ModuleSizeComparator.prototype.compare = function (center1, center2) {
        var value = center2.getEstimatedModuleSize() - center1.getEstimatedModuleSize();
        return value < 0.0 ? -1 : value > 0.0 ? 1 : 0;
    };
    return ModuleSizeComparator;
}());
//# sourceMappingURL=MultiFinderPatternFinder.js.map