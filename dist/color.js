"use strict";
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.colors = void 0;
var color_1 = __importDefault(require("color"));
var palette = [
    '#32213a',
    '#383b53',
    '#66717e',
    '#d4d6b9',
    '#d1caa1',
    '#cadbc0',
    '#c94277',
    '#a27e6f',
    '#94524a',
    '#820263',
];
var weeks = __spread(Array(52).keys()).map(function (zeroIndexed) { return zeroIndexed + 1; });
function getColor(weekNumber) {
    var colorIndex = weekNumber % 10;
    return palette[colorIndex];
}
exports.colors = weeks.map(function (weekNumber) {
    if (weekNumber === 1) {
        return '#221627';
    }
    if (weekNumber === 52) {
        return '#FB0EC0';
    }
    var color = getColor(weekNumber);
    return color_1["default"](color).hex().substring(1, 7);
});
