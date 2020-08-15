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
exports.__esModule = true;
exports.getContestPeriod = void 0;
function getContestPeriod(date) {
    var fullLabel = date.format('WW-YYYY');
    var _a = __read(fullLabel.split('-').map(function (n) { return parseInt(n); }), 2), week = _a[0], year = _a[1];
    return {
        week: week,
        year: year,
        fullLabel: fullLabel
    };
}
exports.getContestPeriod = getContestPeriod;
