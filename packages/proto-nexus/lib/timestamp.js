"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestampToDate = void 0;
function timestampToDate(input) {
    if (input == null)
        return null;
    return new Date(input.getSeconds() * 1000 + input.getNanos() / 1e6);
}
exports.timestampToDate = timestampToDate;
