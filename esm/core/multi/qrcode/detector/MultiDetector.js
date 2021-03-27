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
import DecodeHintType from '../../../DecodeHintType';
import NotFoundException from '../../../NotFoundException';
import Detector from '../../../qrcode/detector/Detector';
import ReaderException from '../../../ReaderException';
import MultiFinderPatternFinder from './MultiFinderPatternFinder';
// package com.google.zxing.multi.qrcode.detector;
// import com.google.zxing.DecodeHintType;
// import com.google.zxing.NotFoundException;
// import com.google.zxing.ReaderException;
// import com.google.zxing.ResultPointCallback;
// import com.google.zxing.common.BitMatrix;
// import com.google.zxing.common.DetectorResult;
// import com.google.zxing.qrcode.detector.Detector;
// import com.google.zxing.qrcode.detector.FinderPatternInfo;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.Map;
/**
 * <p>Encapsulates logic that can detect one or more QR Codes in an image, even if the QR Code
 * is rotated or skewed, or partially obscured.</p>
 *
 * @author Sean Owen
 * @author Hannes Erven
 */
var MultiDetector = /** @class */ (function (_super) {
    __extends(MultiDetector, _super);
    function MultiDetector(image) {
        return _super.call(this, image) || this;
    }
    /** @throws NotFoundException */
    MultiDetector.prototype.detectMulti = function (hints) {
        var e_1, _a;
        var image = this.getImage();
        var resultPointCallback = hints == null ? null : hints.get(DecodeHintType.NEED_RESULT_POINT_CALLBACK);
        var finder = new MultiFinderPatternFinder(image, resultPointCallback);
        var infos = finder.findMulti(hints);
        if (infos.length === 0) {
            throw NotFoundException.getNotFoundInstance();
        }
        var result = [];
        try {
            for (var infos_1 = __values(infos), infos_1_1 = infos_1.next(); !infos_1_1.done; infos_1_1 = infos_1.next()) {
                var info = infos_1_1.value;
                try {
                    result.push(this.processFinderPatternInfo(info));
                }
                catch (e) {
                    if (e instanceof ReaderException) {
                        // ignore
                    }
                    else {
                        throw e;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (infos_1_1 && !infos_1_1.done && (_a = infos_1.return)) _a.call(infos_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (result.length === 0) {
            return MultiDetector.EMPTY_DETECTOR_RESULTS;
        }
        else {
            return result /* .toArray(EMPTY_DETECTOR_RESULTS) */;
        }
    };
    MultiDetector.EMPTY_DETECTOR_RESULTS = [];
    return MultiDetector;
}(Detector));
export default MultiDetector;
//# sourceMappingURL=MultiDetector.js.map