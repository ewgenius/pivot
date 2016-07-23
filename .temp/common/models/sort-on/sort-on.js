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
const dimension_1 = require('../dimension/dimension');
const measure_1 = require('../measure/measure');
var check;
class SortOn {
    constructor(parameters) {
        this.dimension = parameters.dimension;
        this.measure = parameters.measure;
    }
    static isSortOn(candidate) {
        return immutable_class_1.isInstanceOf(candidate, SortOn);
    }
    static equal(s1, s2) {
        return s1 === s2 || s1.equals(s2);
    }
    static getName(s) {
        return s.toName();
    }
    static getTitle(s) {
        return s.getTitle();
    }
    static fromDimension(dimension) {
        return new SortOn({ dimension: dimension });
    }
    static fromMeasure(measure) {
        return new SortOn({ measure: measure });
    }
    static fromSortAction(sortAction, dataCube, fallbackDimension) {
        if (!sortAction)
            return SortOn.fromDimension(fallbackDimension);
        var sortOnName = sortAction.expression.name;
        var measure = dataCube.getMeasure(sortOnName);
        if (measure)
            return SortOn.fromMeasure(measure);
        return SortOn.fromDimension(fallbackDimension);
    }
    static fromJS(parameters) {
        var value = {};
        if (parameters.dimension) {
            value.dimension = dimension_1.Dimension.fromJS(parameters.dimension);
        }
        else {
            value.measure = measure_1.Measure.fromJS(parameters.measure);
        }
        return new SortOn(value);
    }
    valueOf() {
        return {
            dimension: this.dimension,
            measure: this.measure
        };
    }
    toJS() {
        var js = {};
        if (this.dimension) {
            js.dimension = this.dimension.toJS();
        }
        else {
            js.measure = this.measure.toJS();
        }
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[SortOn: ${this.toName()}]`;
    }
    equals(other) {
        return SortOn.isSortOn(other) &&
            (this.dimension ? this.dimension.equals(other.dimension) : this.measure.equals(other.measure));
    }
    toName() {
        var { measure } = this;
        return measure ? measure.name : this.dimension.name;
    }
    getTitle() {
        var { measure } = this;
        return measure ? measure.title : this.dimension.title;
    }
    getExpression() {
        return plywood_1.$(this.toName());
    }
}
exports.SortOn = SortOn;
check = SortOn;
