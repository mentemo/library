import BarcodeFormat from '../BarcodeFormat';
export function isBarcodeFormatValue(num) {
    var values = Object.keys(BarcodeFormat).map(function (i) { return Number(i); }).filter(Number.isInteger);
    return values.includes(num);
}
//# sourceMappingURL=BarcodeFormaHelpers.js.map