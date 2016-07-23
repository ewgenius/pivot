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
const immutable_class_1 = require('immutable-class');
const plywood_1 = require('plywood');
const general_1 = require('../../../common/utils/general/general');
const NULL_COLOR = '#666666';
//const OTHERS_COLOR = '#AAAAAA';
const NORMAL_COLORS = [
    '#2D95CA',
    '#EFB925',
    '#DA4E99',
    '#4CC873',
    '#745CBD',
    '#EA7136',
    '#E68EE0',
    '#218C35',
    '#B0B510',
    '#904064'
];
function valuesToJS(values) {
    var valuesJS = {};
    for (var i = 0; i < NORMAL_COLORS.length; i++) {
        if (!general_1.hasOwnProperty(values, i))
            continue;
        valuesJS[i] = plywood_1.valueToJS(values[i]);
    }
    return valuesJS;
}
function valueEquals(v1, v2) {
    if (v1 === v2)
        return true;
    if (!v1 !== !v2)
        return false;
    if (v1.toISOString && v2.toISOString)
        return v1.valueOf() === v2.valueOf();
    if (immutable_class_1.isImmutableClass(v1))
        return v1.equals(v2);
    return false;
}
function valuesEqual(values1, values2) {
    if (!Boolean(values1) === Boolean(values2))
        return false;
    if (values1 === values2)
        return true;
    if (!values1 !== !values2)
        return false;
    if (typeof values1 !== typeof values2)
        return false;
    for (var i = 0; i < NORMAL_COLORS.length; i++) {
        var v1 = values1[i];
        var v2 = values2[i];
        if (general_1.hasOwnProperty(values1, i) !== general_1.hasOwnProperty(values2, i))
            return false;
        if (!valueEquals(v1, v2))
            return false;
    }
    return true;
}
function cloneValues(values) {
    var newValues = {};
    for (var i = 0; i < NORMAL_COLORS.length; i++) {
        if (!general_1.hasOwnProperty(values, i))
            continue;
        newValues[i] = values[i];
    }
    return newValues;
}
var check;
class Colors {
    constructor(parameters) {
        this.dimension = parameters.dimension;
        if (!this.dimension)
            throw new Error('must have a dimension');
        this.values = parameters.values;
        this.hasNull = parameters.hasNull;
        this.limit = parameters.limit;
        if (!this.values && !this.limit)
            throw new Error('must have values or limit');
    }
    static isColors(candidate) {
        return immutable_class_1.isInstanceOf(candidate, Colors);
    }
    static fromLimit(dimension, limit) {
        return new Colors({ dimension: dimension, limit: limit });
    }
    static fromValues(dimension, values) {
        var valueLookup = {};
        var hasNull = false;
        var n = Math.min(values.length, NORMAL_COLORS.length + 1);
        var i = 0;
        var j = 0;
        while (i < n) {
            var v = values[i];
            if (v === null) {
                hasNull = true;
            }
            else {
                valueLookup[j] = v;
                j++;
            }
            i++;
        }
        return new Colors({
            dimension: dimension,
            hasNull: hasNull,
            values: valueLookup
        });
    }
    static fromJS(parameters) {
        var value = {
            dimension: parameters.dimension,
            limit: parameters.limit
        };
        var valuesJS = parameters.values;
        if (valuesJS) {
            var hasNull = Boolean(parameters.hasNull);
            var values = {};
            for (var i = 0; i < NORMAL_COLORS.length; i++) {
                if (!general_1.hasOwnProperty(valuesJS, i))
                    continue;
                var vJS = valuesJS[i];
                if (vJS === null) {
                    hasNull = true; // Back compat (there might be a null in values)
                }
                else {
                    values[i] = plywood_1.valueFromJS(vJS);
                }
            }
            value.values = values;
            value.hasNull = hasNull;
        }
        return new Colors(value);
    }
    valueOf() {
        return {
            dimension: this.dimension,
            values: this.values,
            hasNull: this.hasNull,
            limit: this.limit
        };
    }
    toJS() {
        var js = {
            dimension: this.dimension
        };
        if (this.values)
            js.values = valuesToJS(this.values);
        if (this.hasNull)
            js.hasNull = true;
        if (this.limit)
            js.limit = this.limit;
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[Colors: ${this.dimension}]`;
    }
    equals(other) {
        return Colors.isColors(other) &&
            valuesEqual(this.values, other.values) &&
            this.hasNull === other.hasNull &&
            this.limit === other.limit;
    }
    numColors() {
        var { values, limit } = this;
        if (values) {
            return Object.keys(values).length + Number(this.hasNull);
        }
        return limit;
    }
    toArray() {
        var { values, hasNull } = this;
        if (!values)
            return null;
        var vs = [];
        if (hasNull)
            vs.push(null);
        for (var i = 0; i < NORMAL_COLORS.length; i++) {
            if (!general_1.hasOwnProperty(values, i))
                continue;
            vs.push(values[i]);
        }
        return vs;
    }
    toSet() {
        if (!this.values)
            return null;
        return plywood_1.Set.fromJS(this.toArray());
    }
    toHavingFilter(segmentName) {
        var { dimension, values } = this;
        if (!segmentName)
            segmentName = dimension;
        if (!values)
            return null;
        return new plywood_1.FilterAction({
            expression: plywood_1.$(segmentName).in(this.toSet())
        });
    }
    toLimitAction() {
        return new plywood_1.LimitAction({
            limit: this.numColors()
        });
    }
    toggle(v) {
        return this.has(v) ? this.remove(v) : this.add(v);
    }
    valueIndex(v) {
        var { values } = this;
        if (!values)
            return -1;
        for (var i = 0; i < NORMAL_COLORS.length; i++) {
            if (!general_1.hasOwnProperty(values, i))
                continue;
            if (valueEquals(values[i], v))
                return i;
        }
        return -1;
    }
    nextIndex() {
        var { values } = this;
        if (!values)
            return 0;
        for (var i = 0; i < NORMAL_COLORS.length; i++) {
            if (general_1.hasOwnProperty(values, i))
                continue;
            return i;
        }
        return -1;
    }
    has(v) {
        if (v == null)
            return this.hasNull;
        return this.valueIndex(v) !== -1;
    }
    add(v) {
        if (this.has(v))
            return this;
        var value = this.valueOf();
        if (v === null) {
            value.hasNull = true;
        }
        else {
            var idx = this.nextIndex();
            if (idx === -1)
                return this;
            value.values = value.values ? cloneValues(value.values) : {};
            value.values[idx] = v;
            delete value.limit;
        }
        return new Colors(value);
    }
    remove(v) {
        if (!this.has(v))
            return this;
        var value = this.valueOf();
        if (v == null) {
            value.hasNull = false;
        }
        else {
            var idx = this.valueIndex(v);
            if (idx === -1)
                return this;
            value.values = cloneValues(value.values);
            delete value.values[idx];
            delete value.limit;
        }
        return new Colors(value);
    }
    getColors(valuesToColor) {
        var { values, limit, hasNull } = this;
        if (values) {
            return valuesToColor.map(value => {
                if (value === null && hasNull)
                    return NULL_COLOR;
                var colorIdx = this.valueIndex(value);
                return colorIdx === -1 ? null : NORMAL_COLORS[colorIdx];
            });
        }
        else {
            var colors = [];
            var colorIdx = 0;
            for (var i = 0; i < valuesToColor.length; i++) {
                if (i < limit) {
                    var v = valuesToColor[i];
                    if (v === null) {
                        colors.push(NULL_COLOR);
                    }
                    else {
                        colors.push(NORMAL_COLORS[colorIdx]);
                        colorIdx++;
                    }
                }
                else {
                    colors.push(null);
                }
            }
            return colors;
        }
    }
}
exports.Colors = Colors;
check = Colors;
