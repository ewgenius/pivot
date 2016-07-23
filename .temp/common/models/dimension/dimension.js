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
const general_1 = require('../../utils/general/general');
const granularity_1 = require("../granularity/granularity");
const immutable_class_2 = require("immutable-class");
var geoName = /continent|country|city|region/i;
function isGeo(name) {
    return geoName.test(name);
}
function typeToKind(type) {
    if (!type)
        return type;
    return type.toLowerCase().replace(/_/g, '-').replace(/-range$/, '');
}
var check;
class Dimension {
    constructor(parameters) {
        var name = parameters.name;
        general_1.verifyUrlSafeName(name);
        this.name = name;
        this.title = parameters.title || general_1.makeTitle(name);
        var formula = parameters.formula || plywood_1.$(name).toString();
        this.formula = formula;
        this.expression = plywood_1.Expression.parse(formula);
        var kind = parameters.kind || typeToKind(this.expression.type) || 'string';
        this.kind = kind;
        if (kind === 'string' && isGeo(name)) {
            this.className = 'string-geo';
        }
        else {
            this.className = kind;
        }
        if (parameters.url) {
            if (typeof parameters.url !== 'string') {
                throw new Error(`unsupported url: ${parameters.url}: only strings are supported`);
            }
            this.url = parameters.url;
        }
        if (parameters.granularities) {
            if (parameters.granularities.length !== 5)
                throw new Error('there must be exactly 5 granularities');
            this.granularities = parameters.granularities;
        }
        if (parameters.bucketedBy)
            this.bucketedBy = parameters.bucketedBy;
    }
    static isDimension(candidate) {
        return immutable_class_1.isInstanceOf(candidate, Dimension);
    }
    static getDimension(dimensions, dimensionName) {
        if (!dimensionName)
            return null;
        dimensionName = dimensionName.toLowerCase(); // Case insensitive
        return dimensions.find(dimension => dimension.name.toLowerCase() === dimensionName);
    }
    static getDimensionByExpression(dimensions, expression) {
        return dimensions.find(dimension => dimension.expression.equals(expression));
    }
    static fromJS(parameters) {
        var parameterExpression = parameters.expression; // Back compat
        var value = {
            name: parameters.name,
            title: parameters.title,
            formula: parameters.formula || (typeof parameterExpression === 'string' ? parameterExpression : null),
            kind: parameters.kind || typeToKind(parameters.type),
            url: parameters.url
        };
        var granularities = parameters.granularities;
        if (granularities) {
            if (!Array.isArray(granularities) || granularities.length !== 5) {
                throw new Error(`must have list of 5 granularities in dimension '${parameters.name}'`);
            }
            var runningActionType = null;
            value.granularities = granularities.map((g) => {
                var granularity = granularity_1.granularityFromJS(g);
                if (runningActionType === null)
                    runningActionType = granularity.action;
                if (granularity.action !== runningActionType)
                    throw new Error("granularities must have the same type of actions");
                return granularity;
            });
        }
        var bucketedBy = parameters.bucketedBy;
        if (bucketedBy) {
            value.bucketedBy = granularity_1.granularityFromJS(bucketedBy);
        }
        return new Dimension(value);
    }
    valueOf() {
        return {
            name: this.name,
            title: this.title,
            formula: this.formula,
            kind: this.kind,
            url: this.url,
            granularities: this.granularities,
            bucketedBy: this.bucketedBy
        };
    }
    toJS() {
        var js = {
            name: this.name,
            title: this.title,
            formula: this.formula,
            kind: this.kind
        };
        if (this.url)
            js.url = this.url;
        if (this.granularities)
            js.granularities = this.granularities.map((g) => { return granularity_1.granularityToJS(g); });
        if (this.bucketedBy)
            js.bucketedBy = granularity_1.granularityToJS(this.bucketedBy);
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[Dimension: ${this.name}]`;
    }
    equals(other) {
        return Dimension.isDimension(other) &&
            this.name === other.name &&
            this.title === other.title &&
            this.formula === other.formula &&
            this.kind === other.kind &&
            this.url === other.url &&
            immutable_class_2.immutableArraysEqual(this.granularities, other.granularities) &&
            granularity_1.granularityEquals(this.bucketedBy, other.bucketedBy);
    }
    isContinuous() {
        const { kind } = this;
        return kind === 'time' || kind === 'number';
    }
    change(propertyName, newValue) {
        var v = this.valueOf();
        if (!v.hasOwnProperty(propertyName)) {
            throw new Error(`Unknown property : ${propertyName}`);
        }
        v[propertyName] = newValue;
        return new Dimension(v);
    }
    changeKind(newKind) {
        return this.change('kind', newKind);
    }
    changeName(newName) {
        return this.change('name', newName);
    }
    changeTitle(newTitle) {
        return this.change('title', newTitle);
    }
    changeFormula(newFormula) {
        return this.change('formula', newFormula);
    }
}
exports.Dimension = Dimension;
check = Dimension;
