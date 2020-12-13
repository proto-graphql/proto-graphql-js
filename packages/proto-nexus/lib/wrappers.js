"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapStringValue = exports.unwrapBoolValue = exports.unwrapDoubleValue = exports.unwrapFloatValue = exports.unwrapUInt64Value = exports.unwrapUInt32Value = exports.unwrapInt64Value = exports.unwrapInt32Value = void 0;
function unwrapInt32Value(input) {
    if (input === undefined)
        return null;
    return input.getValue();
}
exports.unwrapInt32Value = unwrapInt32Value;
function unwrapInt64Value(input) {
    if (input === undefined)
        return null;
    return input.getValue();
}
exports.unwrapInt64Value = unwrapInt64Value;
function unwrapUInt32Value(input) {
    if (input === undefined)
        return null;
    return input.getValue();
}
exports.unwrapUInt32Value = unwrapUInt32Value;
function unwrapUInt64Value(input) {
    if (input === undefined)
        return null;
    return input.getValue();
}
exports.unwrapUInt64Value = unwrapUInt64Value;
function unwrapFloatValue(input) {
    if (input === undefined)
        return null;
    return input.getValue();
}
exports.unwrapFloatValue = unwrapFloatValue;
function unwrapDoubleValue(input) {
    if (input === undefined)
        return null;
    return input.getValue();
}
exports.unwrapDoubleValue = unwrapDoubleValue;
function unwrapBoolValue(input) {
    if (input === undefined)
        return null;
    return input.getValue();
}
exports.unwrapBoolValue = unwrapBoolValue;
function unwrapStringValue(input) {
    if (input === undefined)
        return null;
    return input.getValue();
}
exports.unwrapStringValue = unwrapStringValue;
