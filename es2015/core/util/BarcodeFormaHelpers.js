import BarcodeFormat from '../BarcodeFormat';
export function isBarcodeFormatValue(num) {
    const values = Object.keys(BarcodeFormat).map(i => Number(i)).filter(Number.isInteger);
    return values.includes(num);
}
//# sourceMappingURL=BarcodeFormaHelpers.js.map