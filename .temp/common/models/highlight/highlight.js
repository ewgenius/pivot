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
const filter_1 = require('../filter/filter');
var check;
class Highlight {
    constructor(parameters) {
        var owner = parameters.owner;
        if (typeof owner !== 'string')
            throw new TypeError('owner must be a string');
        this.owner = owner;
        this.delta = parameters.delta;
        this.measure = parameters.measure || null;
    }
    static isHighlight(candidate) {
        return immutable_class_1.isInstanceOf(candidate, Highlight);
    }
    static fromJS(parameters) {
        return new Highlight({
            owner: parameters.owner,
            delta: filter_1.Filter.fromJS(parameters.delta),
            measure: parameters.measure
        });
    }
    valueOf() {
        return {
            owner: this.owner,
            delta: this.delta,
            measure: this.measure
        };
    }
    toJS() {
        var js = {
            owner: this.owner,
            delta: this.delta.toJS()
        };
        if (this.measure)
            js.measure = this.measure;
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[Highlight ${this.owner}]`;
    }
    equals(other) {
        return Highlight.isHighlight(other) &&
            this.owner === other.owner &&
            this.delta.equals(other.delta) &&
            this.measure === other.measure;
    }
    applyToFilter(filter) {
        return filter.applyDelta(this.delta);
    }
    constrainToDimensions(dimensions, timeAttribute) {
        var { delta } = this;
        var newDelta = delta.constrainToDimensions(dimensions, timeAttribute);
        if (newDelta === delta)
            return this;
        if (newDelta.length() === 0)
            return null;
        var value = this.valueOf();
        value.delta = newDelta;
        return new Highlight(value);
    }
}
exports.Highlight = Highlight;
check = Highlight;
