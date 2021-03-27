"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBarcodeFormatValue = void 0;
var BarcodeFormat_1 = require("../BarcodeFormat");
function isBarcodeFormatValue(num) {
    var values = Object.keys(BarcodeFormat_1.default).map(function (i) { return Number(i); }).filter(Number.isInteger);
    return values.includes(num);
}
exports.isBarcodeFormatValue = isBarcodeFormatValue;
//# sourceMappingURL=BarcodeFormaHelpers.js.map