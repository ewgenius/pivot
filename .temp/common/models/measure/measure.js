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
const numeral = require('numeral');
const plywood_1 = require('plywood');
const general_1 = require('../../utils/general/general');
function formatFnFactory(format) {
    return (n) => {
        if (isNaN(n) || !isFinite(n))
            return '-';
        return numeral(n).format(format);
    };
}
var check;
class Measure {
    constructor(parameters) {
        var name = parameters.name;
        general_1.verifyUrlSafeName(name);
        this.name = name;
        this.title = parameters.title || general_1.makeTitle(name);
        var formula = parameters.formula;
        if (!formula)
            throw new Error('measure must have formula');
        this.formula = formula;
        this.expression = plywood_1.Expression.parse(formula);
        var format = parameters.format || Measure.DEFAULT_FORMAT;
        if (format[0] === '(')
            throw new Error('can not have format that uses ( )');
        this.format = format;
        this.formatFn = formatFnFactory(format);
    }
    static isMeasure(candidate) {
        return immutable_class_1.isInstanceOf(candidate, Measure);
    }
    static getMeasure(measures, measureName) {
        if (!measureName)
            return null;
        measureName = measureName.toLowerCase(); // Case insensitive
        return measures.find(measure => measure.name.toLowerCase() === measureName);
    }
    /**
     * Look for all instances of aggregateAction($blah) and return the blahs
     * @param ex
     * @returns {string[]}
     */
    static getAggregateReferences(ex) {
        var references = [];
        ex.forEach((ex) => {
            if (ex instanceof plywood_1.ChainExpression) {
                var actions = ex.actions;
                for (var action of actions) {
                    if (action.isAggregate()) {
                        references = references.concat(action.getFreeReferences());
                    }
                }
            }
        });
        return plywood_1.helper.deduplicateSort(references);
    }
    /**
     * Look for all instances of countDistinct($blah) and return the blahs
     * @param ex
     * @returns {string[]}
     */
    static getCountDistinctReferences(ex) {
        var references = [];
        ex.forEach((ex) => {
            if (ex instanceof plywood_1.ChainExpression) {
                var actions = ex.actions;
                for (var action of actions) {
                    if (action.action === 'countDistinct') {
                        references = references.concat(action.getFreeReferences());
                    }
                }
            }
        });
        return plywood_1.helper.deduplicateSort(references);
    }
    static measuresFromAttributeInfo(attribute) {
        var { name, special } = attribute;
        var $main = plywood_1.$('main');
        var ref = plywood_1.$(name);
        if (special) {
            if (special === 'unique' || special === 'theta') {
                return [
                    new Measure({
                        name: general_1.makeUrlSafeName(name),
                        formula: $main.countDistinct(ref).toString()
                    })
                ];
            }
            else if (special === 'histogram') {
                return [
                    new Measure({
                        name: general_1.makeUrlSafeName(name + '_p98'),
                        formula: $main.quantile(ref, 0.98).toString()
                    })
                ];
            }
        }
        var expression = $main.sum(ref);
        var makerAction = attribute.makerAction;
        if (makerAction) {
            switch (makerAction.action) {
                case 'min':
                    expression = $main.min(ref);
                    break;
                case 'max':
                    expression = $main.max(ref);
                    break;
            }
        }
        return [new Measure({
                name: general_1.makeUrlSafeName(name),
                formula: expression.toString()
            })];
    }
    static fromJS(parameters) {
        var name = parameters.name;
        var parameterExpression = parameters.expression; // Back compat
        return new Measure({
            name: name,
            title: parameters.title,
            formula: parameters.formula || (typeof parameterExpression === 'string' ? parameterExpression : null) || plywood_1.$('main').sum(plywood_1.$(name)).toString(),
            format: parameters.format
        });
    }
    valueOf() {
        return {
            name: this.name,
            title: this.title,
            formula: this.formula,
            format: this.format
        };
    }
    toJS() {
        var js = {
            name: this.name,
            title: this.title,
            formula: this.formula
        };
        if (this.format !== Measure.DEFAULT_FORMAT)
            js.format = this.format;
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[Measure: ${this.name}]`;
    }
    equals(other) {
        return Measure.isMeasure(other) &&
            this.name === other.name &&
            this.title === other.title &&
            this.formula === other.formula &&
            this.format === other.format;
    }
    toApplyAction() {
        var { name, expression } = this;
        return new plywood_1.ApplyAction({
            name: name,
            expression: expression
        });
    }
    formatDatum(datum) {
        return this.formatFn(datum[this.name]);
    }
    change(propertyName, newValue) {
        var v = this.valueOf();
        if (!v.hasOwnProperty(propertyName)) {
            throw new Error(`Unknown property : ${propertyName}`);
        }
        v[propertyName] = newValue;
        return new Measure(v);
    }
    changeTitle(newTitle) {
        return this.change('title', newTitle);
    }
    changeFormula(newFormula) {
        return this.change('formula', newFormula);
    }
}
Measure.DEFAULT_FORMAT = '0,0.0 a';
Measure.INTEGER_FORMAT = '0,0 a';
exports.Measure = Measure;
check = Measure;
