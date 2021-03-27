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
export default /* public final */ class MultiDetector extends Detector {
    constructor(image) {
        super(image);
    }
    /** @throws NotFoundException */
    detectMulti(hints) {
        const image = this.getImage();
        const resultPointCallback = hints == null ? null : hints.get(DecodeHintType.NEED_RESULT_POINT_CALLBACK);
        const finder = new MultiFinderPatternFinder(image, resultPointCallback);
        const infos = finder.findMulti(hints);
        if (infos.length === 0) {
            throw NotFoundException.getNotFoundInstance();
        }
        const result = [];
        for (const info of infos) {
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
        if (result.length === 0) {
            return MultiDetector.EMPTY_DETECTOR_RESULTS;
        }
        else {
            return result /* .toArray(EMPTY_DETECTOR_RESULTS) */;
        }
    }
}
MultiDetector.EMPTY_DETECTOR_RESULTS = [];
//# sourceMappingURL=MultiDetector.js.map