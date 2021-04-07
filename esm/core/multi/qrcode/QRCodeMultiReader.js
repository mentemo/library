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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import BarcodeFormat from '../../BarcodeFormat';
import QRCodeDecoderMetaData from '../../qrcode/decoder/QRCodeDecoderMetaData';
import QRCodeReader from '../../qrcode/QRCodeReader';
import ReaderException from '../../ReaderException';
import Result from '../../Result';
import ResultMetadataType from '../../ResultMetadataType';
import ByteArrayOutputStream from '../../util/ByteArrayOutputStream';
import Collections from '../../util/Collections';
import Integer from '../../util/Integer';
import StringBuilder from '../../util/StringBuilder';
import MultiDetector from './detector/MultiDetector';
// package com.google.zxing.multi.qrcode;
// import com.google.zxing.BarcodeFormat;
// import com.google.zxing.BinaryBitmap;
// import com.google.zxing.DecodeHintType;
// import com.google.zxing.NotFoundException;
// import com.google.zxing.ReaderException;
// import com.google.zxing.Result;
// import com.google.zxing.ResultMetadataType;
// import com.google.zxing.ResultPoint;
// import com.google.zxing.common.DecoderResult;
// import com.google.zxing.common.DetectorResult;
// import com.google.zxing.multi.MultipleBarcodeReader;
// import com.google.zxing.multi.qrcode.detector.MultiDetector;
// import com.google.zxing.qrcode.QRCodeReader;
// import com.google.zxing.qrcode.decoder.QRCodeDecoderMetaData;
// import java.io.ByteArrayOutputStream;
// import java.io.Serializable;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.Map;
// import java.util.Collections;
// import java.util.Comparator;
/**
 * This implementation can detect and decode multiple QR Codes in an image.
 *
 * @author Sean Owen
 * @author Hannes Erven
 */
var QRCodeMultiReader = /** @class */ (function (_super) {
    __extends(QRCodeMultiReader, _super);
    function QRCodeMultiReader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * TYPESCRIPTPORT: this is an overloaded method so here it'll work only as a entrypoint for choosing which overload to call.
     */
    QRCodeMultiReader.prototype.decodeMultiple = function (image, hints) {
        if (hints === void 0) { hints = null; }
        if (hints && hints instanceof Map) {
            return this.decodeMultipleImpl(image, hints);
        }
        return this.decodeMultipleOverload1(image);
    };
    /**
     * @throws NotFoundException
     * @override decodeMultiple
     */
    QRCodeMultiReader.prototype.decodeMultipleOverload1 = function (image) {
        return this.decodeMultipleImpl(image, null);
    };
    /**
     * @override
     * @throws NotFoundException
     */
    QRCodeMultiReader.prototype.decodeMultipleImpl = function (image, hints) {
        var e_1, _a;
        var results = [];
        var detectorResults = new MultiDetector(image.getBlackMatrix()).detectMulti(hints);
        try {
            for (var detectorResults_1 = __values(detectorResults), detectorResults_1_1 = detectorResults_1.next(); !detectorResults_1_1.done; detectorResults_1_1 = detectorResults_1.next()) {
                var detectorResult = detectorResults_1_1.value;
                try {
                    var decoderResult = this.getDecoder().decodeBitMatrix(detectorResult.getBits(), hints);
                    var points = detectorResult.getPoints();
                    // If the code was mirrored: swap the bottom-left and the top-right points.
                    if (decoderResult.getOther() instanceof QRCodeDecoderMetaData) {
                        decoderResult.getOther().applyMirroredCorrection(points);
                    }
                    var result = new Result(decoderResult.getText(), decoderResult.getRawBytes(), points, BarcodeFormat.QR_CODE);
                    var byteSegments = decoderResult.getByteSegments();
                    if (byteSegments != null) {
                        result.putMetadata(ResultMetadataType.BYTE_SEGMENTS, byteSegments);
                    }
                    var ecLevel = decoderResult.getECLevel();
                    if (ecLevel != null) {
                        result.putMetadata(ResultMetadataType.ERROR_CORRECTION_LEVEL, ecLevel);
                    }
                    if (decoderResult.hasStructuredAppend()) {
                        result.putMetadata(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE, decoderResult.getStructuredAppendSequenceNumber());
                        result.putMetadata(ResultMetadataType.STRUCTURED_APPEND_PARITY, decoderResult.getStructuredAppendParity());
                    }
                    results.push(result);
                }
                catch (re) {
                    if (re instanceof ReaderException) {
                        // ignore and continue
                    }
                    else {
                        throw re;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (detectorResults_1_1 && !detectorResults_1_1.done && (_a = detectorResults_1.return)) _a.call(detectorResults_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (results.length === 0) {
            return QRCodeMultiReader.EMPTY_RESULT_ARRAY;
        }
        else {
            return results /* .toArray(QRCodeMultiReader.EMPTY_RESULT_ARRAY) */;
        }
    };
    QRCodeMultiReader.processStructuredAppend = function (results) {
        var e_2, _a, e_3, _b, e_4, _c, e_5, _d;
        var newResults = [];
        var saResultsMap = new Map();
        try {
            for (var results_1 = __values(results), results_1_1 = results_1.next(); !results_1_1.done; results_1_1 = results_1.next()) {
                var result = results_1_1.value;
                if (result.getResultMetadata().has(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE)) {
                    var parity = result.getResultMetadata().has(ResultMetadataType.STRUCTURED_APPEND_PARITY) ? result.getResultMetadata().get(ResultMetadataType.STRUCTURED_APPEND_PARITY) : -1;
                    if (!saResultsMap.has(parity)) {
                        saResultsMap.set(parity, []);
                    }
                    saResultsMap.get(parity).push(result);
                }
                else {
                    newResults.push(result);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (results_1_1 && !results_1_1.done && (_a = results_1.return)) _a.call(results_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        if (saResultsMap.size === 0) {
            return results;
        }
        try {
            // sort and concatenate the SA list items
            for (var saResultsMap_1 = __values(saResultsMap), saResultsMap_1_1 = saResultsMap_1.next(); !saResultsMap_1_1.done; saResultsMap_1_1 = saResultsMap_1.next()) {
                var _e = __read(saResultsMap_1_1.value, 2), saResults = _e[1];
                Collections.sort(saResults, new SAComparator());
                var newText = new StringBuilder();
                var newRawBytes = new ByteArrayOutputStream();
                var newByteSegment = new ByteArrayOutputStream();
                try {
                    for (var saResults_1 = (e_4 = void 0, __values(saResults)), saResults_1_1 = saResults_1.next(); !saResults_1_1.done; saResults_1_1 = saResults_1.next()) {
                        var saResult = saResults_1_1.value;
                        newText.append(saResult.getText());
                        var saBytes = saResult.getRawBytes();
                        newRawBytes.writeBytesOffset(saBytes, 0, saBytes.length);
                        // @SuppressWarnings("unchecked")
                        var byteSegments = saResult.getResultMetadata().get(ResultMetadataType.BYTE_SEGMENTS);
                        if (byteSegments != null) {
                            try {
                                for (var byteSegments_1 = (e_5 = void 0, __values(byteSegments)), byteSegments_1_1 = byteSegments_1.next(); !byteSegments_1_1.done; byteSegments_1_1 = byteSegments_1.next()) {
                                    var segment = byteSegments_1_1.value;
                                    newByteSegment.writeBytesOffset(segment, 0, segment.length);
                                }
                            }
                            catch (e_5_1) { e_5 = { error: e_5_1 }; }
                            finally {
                                try {
                                    if (byteSegments_1_1 && !byteSegments_1_1.done && (_d = byteSegments_1.return)) _d.call(byteSegments_1);
                                }
                                finally { if (e_5) throw e_5.error; }
                            }
                        }
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (saResults_1_1 && !saResults_1_1.done && (_c = saResults_1.return)) _c.call(saResults_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
                var newResult = new Result(newText.toString(), newRawBytes.toByteArray(), QRCodeMultiReader.NO_POINTS, BarcodeFormat.QR_CODE);
                if (newByteSegment.size() > 0) {
                    newResult.putMetadata(ResultMetadataType.BYTE_SEGMENTS, Collections.singletonList(newByteSegment.toByteArray()));
                }
                newResults.push(newResult); // TYPESCRIPTPORT: inserted element at the start of the array because it seems the Java version does that as well.
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (saResultsMap_1_1 && !saResultsMap_1_1.done && (_b = saResultsMap_1.return)) _b.call(saResultsMap_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return newResults;
    };
    QRCodeMultiReader.EMPTY_RESULT_ARRAY = [];
    QRCodeMultiReader.NO_POINTS = new Array();
    return QRCodeMultiReader;
}(QRCodeReader));
export default QRCodeMultiReader;
/* private static final*/ var SAComparator = /** @class */ (function () {
    function SAComparator() {
    }
    /**
     * @override
     */
    SAComparator.prototype.compare = function (a, b) {
        var aNumber = a.getResultMetadata().get(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE);
        var bNumber = b.getResultMetadata().get(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE);
        return Integer.compare(aNumber, bNumber);
    };
    return SAComparator;
}());
//# sourceMappingURL=QRCodeMultiReader.js.map