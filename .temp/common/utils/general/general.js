/*
 * Copyright 2015-2016 Imply Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";
const immutable_1 = require('immutable');
const immutable_class_1 = require('immutable-class');
var objectHasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj, key) {
    if (!obj)
        return false;
    return objectHasOwnProperty.call(obj, key);
}
exports.hasOwnProperty = hasOwnProperty;
function moveInList(list, itemIndex, insertPoint) {
    var n = list.size;
    if (itemIndex < 0 || itemIndex >= n)
        throw new Error('itemIndex out of range');
    if (insertPoint < 0 || insertPoint > n)
        throw new Error('insertPoint out of range');
    var newArray = [];
    list.forEach((value, i) => {
        if (i === insertPoint)
            newArray.push(list.get(itemIndex));
        if (i !== itemIndex)
            newArray.push(value);
    });
    if (n === insertPoint)
        newArray.push(list.get(itemIndex));
    return immutable_1.List(newArray);
}
exports.moveInList = moveInList;
function makeTitle(name) {
    return name
        .replace(/^[ _\-]+|[ _\-]+$/g, '')
        .replace(/(^|[_\-]+)\w/g, (s) => {
        return s.replace(/[_\-]+/, ' ').toUpperCase();
    })
        .replace(/[a-z0-9][A-Z]/g, (s) => {
        return s[0] + ' ' + s[1];
    });
}
exports.makeTitle = makeTitle;
function immutableListsEqual(listA, listB) {
    if (listA === listB)
        return true;
    if (!listA !== !listB)
        return false;
    return immutable_class_1.immutableArraysEqual(listA.toArray(), listB.toArray());
}
exports.immutableListsEqual = immutableListsEqual;
function collect(wait, fn) {
    var timeout;
    var later = function () {
        timeout = null;
        fn();
    };
    return function () {
        if (!timeout) {
            timeout = setTimeout(later, wait);
        }
    };
}
exports.collect = collect;
const URL_UNSAFE_CHARS = /[^\w.~\-]+/g;
function makeUrlSafeName(name) {
    return name.replace(URL_UNSAFE_CHARS, '_');
}
exports.makeUrlSafeName = makeUrlSafeName;
function verifyUrlSafeName(name) {
    if (typeof name !== 'string')
        throw new TypeError('name must be a string');
    if (!name.length)
        throw new Error('can not have empty name');
    var urlSafeName = makeUrlSafeName(name);
    if (name !== urlSafeName) {
        throw new Error(`'${name}' is not a URL safe name. Try '${urlSafeName}' instead?`);
    }
}
exports.verifyUrlSafeName = verifyUrlSafeName;
function arraySum(inputArray) {
    return inputArray.reduce((pV, cV) => {
        return pV + cV;
    }, 0);
}
exports.arraySum = arraySum;
function findFirstBiggerIndex(array, elementToFind, valueOf) {
    if (!elementToFind)
        return -1;
    return immutable_1.List(array).findIndex(g => valueOf(g) > valueOf(elementToFind));
}
exports.findFirstBiggerIndex = findFirstBiggerIndex;
function findBiggerClosestToIdeal(array, elementToFind, ideal, valueOf) {
    var biggerOrEqualIndex = immutable_1.List(array).findIndex(g => valueOf(g) >= valueOf(elementToFind));
    var biggerArrayOrEqual = array.slice(biggerOrEqualIndex);
    return biggerArrayOrEqual.reduce((pV, cV, i, arr) => Math.abs(valueOf(pV) - valueOf(ideal)) < Math.abs(valueOf(cV) - valueOf(ideal)) ? pV : cV);
}
exports.findBiggerClosestToIdeal = findBiggerClosestToIdeal;
function findExactIndex(array, elementToFind, valueOf) {
    return immutable_1.List(array).findIndex(g => valueOf(g) === valueOf(elementToFind));
}
exports.findExactIndex = findExactIndex;
function findMaxValueIndex(array, valueOf) {
    return array.reduce((currMax, cV, cIdx, arr) => valueOf(cV) > valueOf(arr[currMax]) ? cIdx : currMax, 0);
}
exports.findMaxValueIndex = findMaxValueIndex;
function findMinValueIndex(array, valueOf) {
    return array.reduce((currMax, cV, cIdx, arr) => valueOf(cV) < valueOf(arr[currMax]) ? cIdx : currMax, 0);
}
exports.findMinValueIndex = findMinValueIndex;
function log10(n) {
    return Math.log(n) * Math.LOG10E;
}
function toSignificantDigits(n, digits) {
    var multiplier = Math.pow(10, digits - Math.floor(Math.log(n) / Math.LN10) - 1);
    return Math.round(n * multiplier) / multiplier;
}
exports.toSignificantDigits = toSignificantDigits;
function getNumberOfWholeDigits(n) {
    return Math.max(Math.floor(log10(Math.abs(n))), 0) + 1;
}
exports.getNumberOfWholeDigits = getNumberOfWholeDigits;
// replaces things like %{PORT_NAME}% with the value of vs.PORT_NAME
function inlineVars(obj, vs) {
    return JSON.parse(JSON.stringify(obj).replace(/%\{[\w\-]+\}%/g, (varName) => {
        varName = varName.substr(2, varName.length - 4);
        var v = vs[varName];
        if (typeof v !== 'string')
            throw new Error(`could not find variable '${varName}'`);
        var v = JSON.stringify(v);
        return v.substr(1, v.length - 2);
    }));
}
exports.inlineVars = inlineVars;
function ensureOneOf(value, values, messagePrefix) {
    if (values.indexOf(value) !== -1)
        return;
    var isMessage = typeof value === 'undefined' ? 'not defined' : `'${value}'`;
    throw new Error(`${messagePrefix} must be on of '${values.join("', '")}' (is ${isMessage})`);
}
exports.ensureOneOf = ensureOneOf;
function pluralIfNeeded(n, thing) {
    return `${n} ${thing}${n === 1 ? '' : 's'}`;
}
exports.pluralIfNeeded = pluralIfNeeded;
