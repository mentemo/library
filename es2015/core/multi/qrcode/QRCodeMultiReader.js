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
export default /*public final*/ class QRCodeMultiReader extends QRCodeReader {
    /**
     * TYPESCRIPTPORT: this is an overloaded method so here it'll work only as a entrypoint for choosing which overload to call.
     */
    decodeMultiple(image, hints = null) {
        if (hints && hints instanceof Map) {
            return this.decodeMultipleImpl(image, hints);
        }
        return this.decodeMultipleOverload1(image);
    }
    /**
     * @throws NotFoundException
     * @override decodeMultiple
     */
    decodeMultipleOverload1(image) {
        return this.decodeMultipleImpl(image, null);
    }
    /**
     * @override
     * @throws NotFoundException
     */
    decodeMultipleImpl(image, hints) {
        let results = [];
        const detectorResults = new MultiDetector(image.getBlackMatrix()).detectMulti(hints);
        for (const detectorResult of detectorResults) {
            try {
                const decoderResult = this.getDecoder().decodeBitMatrix(detectorResult.getBits(), hints);
                const points = detectorResult.getPoints();
                // If the code was mirrored: swap the bottom-left and the top-right points.
                if (decoderResult.getOther() instanceof QRCodeDecoderMetaData) {
                    decoderResult.getOther().applyMirroredCorrection(points);
                }
                const result = new Result(decoderResult.getText(), decoderResult.getRawBytes(), points, BarcodeFormat.QR_CODE);
                const byteSegments = decoderResult.getByteSegments();
                if (byteSegments != null) {
                    result.putMetadata(ResultMetadataType.BYTE_SEGMENTS, byteSegments);
                }
                const ecLevel = decoderResult.getECLevel();
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
        if (results.length === 0) {
            return QRCodeMultiReader.EMPTY_RESULT_ARRAY;
        }
        else {
            return results /* .toArray(QRCodeMultiReader.EMPTY_RESULT_ARRAY) */;
        }
    }
    static processStructuredAppend(results) {
        const newResults = [];
        const saResultsMap = new Map();
        for (const result of results) {
            if (result.getResultMetadata().has(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE)) {
                const parity = result.getResultMetadata().has(ResultMetadataType.STRUCTURED_APPEND_PARITY) ? result.getResultMetadata().get(ResultMetadataType.STRUCTURED_APPEND_PARITY) : -1;
                if (!saResultsMap.has(parity)) {
                    saResultsMap.set(parity, []);
                }
                saResultsMap.get(parity).push(result);
            }
            else {
                newResults.push(result);
            }
        }
        if (saResultsMap.size === 0) {
            return results;
        }
        // sort and concatenate the SA list items
        for (const [, saResults] of saResultsMap) {
            Collections.sort(saResults, new SAComparator());
            const newText = new StringBuilder();
            const newRawBytes = new ByteArrayOutputStream();
            const newByteSegment = new ByteArrayOutputStream();
            for (const saResult of saResults) {
                newText.append(saResult.getText());
                const saBytes = saResult.getRawBytes();
                newRawBytes.writeBytesOffset(saBytes, 0, saBytes.length);
                // @SuppressWarnings("unchecked")
                const byteSegments = saResult.getResultMetadata().get(ResultMetadataType.BYTE_SEGMENTS);
                if (byteSegments != null) {
                    for (const segment of byteSegments) {
                        newByteSegment.writeBytesOffset(segment, 0, segment.length);
                    }
                }
            }
            const newResult = new Result(newText.toString(), newRawBytes.toByteArray(), QRCodeMultiReader.NO_POINTS, BarcodeFormat.QR_CODE);
            if (newByteSegment.size() > 0) {
                newResult.putMetadata(ResultMetadataType.BYTE_SEGMENTS, Collections.singletonList(newByteSegment.toByteArray()));
            }
            newResults.push(newResult); // TYPESCRIPTPORT: inserted element at the start of the array because it seems the Java version does that as well.
        }
        return newResults;
    }
}
QRCodeMultiReader.EMPTY_RESULT_ARRAY = [];
QRCodeMultiReader.NO_POINTS = new Array();
/* private static final*/ class SAComparator {
    /**
     * @override
     */
    compare(a, b) {
        const aNumber = a.getResultMetadata().get(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE);
        const bNumber = b.getResultMetadata().get(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE);
        return Integer.compare(aNumber, bNumber);
    }
}
//# sourceMappingURL=QRCodeMultiReader.js.map