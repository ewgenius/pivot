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
const chronoshift_1 = require('chronoshift');
const plywood_1 = require('plywood');
function isLiteral(ex) {
    if (ex instanceof plywood_1.LiteralExpression)
        return plywood_1.TimeRange.isTimeRange(ex.value) || plywood_1.Set.isSet(ex.value) || plywood_1.NumberRange.isNumberRange(ex.value);
    return false;
}
function isRelative(ex) {
    if (ex instanceof plywood_1.ChainExpression) {
        if (ex.type !== 'TIME_RANGE')
            return false;
        var expression = ex.expression;
        if (expression instanceof plywood_1.RefExpression) {
            return expression.name === FilterClause.NOW_REF_NAME || expression.name === FilterClause.MAX_TIME_REF_NAME;
        }
    }
    return false;
}
var check;
class FilterClause {
    constructor(parameters) {
        this.expression = parameters.expression;
        var selection = parameters.selection;
        if (isRelative(selection)) {
            this.relative = true;
        }
        else if (isLiteral(selection)) {
            this.relative = false;
        }
        else {
            throw new Error(`invalid expression ${selection.toString()}`);
        }
        this.selection = selection;
        this.exclude = parameters.exclude || false;
    }
    static isFilterClause(candidate) {
        return immutable_class_1.isInstanceOf(candidate, FilterClause);
    }
    static evaluate(selection, now, maxTime, timezone) {
        if (!selection)
            return null;
        var maxTimeMinuteTop = chronoshift_1.minute.shift(chronoshift_1.minute.floor(maxTime || now, timezone), timezone, 1);
        var datum = {};
        datum[FilterClause.NOW_REF_NAME] = now;
        datum[FilterClause.MAX_TIME_REF_NAME] = maxTimeMinuteTop;
        return selection.defineEnvironment({ timezone: timezone }).getFn()(datum, {});
    }
    static fromExpression(ex) {
        var exclude = false;
        if (ex.lastAction() instanceof plywood_1.NotAction) {
            ex = ex.popAction();
            exclude = true;
        }
        var lastAction = ex.lastAction();
        var dimExpression = ex.popAction();
        if (lastAction instanceof plywood_1.InAction || lastAction instanceof plywood_1.OverlapAction) {
            var selection = lastAction.expression;
            return new FilterClause({
                expression: dimExpression,
                selection: selection,
                exclude: exclude
            });
        }
        throw new Error(`invalid expression ${ex.toString()}`);
    }
    static fromJS(parameters) {
        var value = {
            expression: plywood_1.Expression.fromJS(parameters.expression),
            selection: plywood_1.Expression.fromJS(parameters.selection),
            exclude: Boolean(parameters.exclude)
        };
        return new FilterClause(value);
    }
    valueOf() {
        return {
            expression: this.expression,
            selection: this.selection,
            exclude: this.exclude
        };
    }
    toJS() {
        var js = {
            expression: this.expression.toJS(),
            selection: this.selection.toJS()
        };
        if (this.exclude)
            js.exclude = true;
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[FilterClause: ${this.expression.toString()}]`;
    }
    equals(other) {
        return FilterClause.isFilterClause(other) &&
            this.expression.equals(other.expression) &&
            this.selection.equals(other.selection) &&
            this.exclude === other.exclude;
    }
    toExpression() {
        const { expression, selection } = this;
        var ex = null;
        var selectionType = selection.type;
        if (selectionType === 'TIME_RANGE' || selectionType === 'SET/TIME_RANGE' || selectionType === 'NUMBER_RANGE' || selectionType === 'SET/NUMBER_RANGE') {
            ex = expression.in(selection);
        }
        else {
            ex = expression.overlap(selection);
        }
        if (this.exclude)
            ex = ex.not();
        return ex;
    }
    getLiteralSet() {
        if (this.relative)
            return null;
        var v = this.selection.getLiteralValue();
        return (plywood_1.TimeRange.isTimeRange(v) || plywood_1.NumberRange.isNumberRange(v)) ? plywood_1.Set.fromJS([v]) : v;
    }
    getExtent() {
        var mySet = this.getLiteralSet();
        return mySet ? mySet.extent() : null;
    }
    isLessThanFullDay() {
        var extent = this.getExtent();
        if (!extent)
            return false;
        return extent.end.valueOf() - extent.start.valueOf() < chronoshift_1.day.canonicalLength;
    }
    changeSelection(selection) {
        var value = this.valueOf();
        value.selection = selection;
        return new FilterClause(value);
    }
    changeExclude(exclude) {
        var value = this.valueOf();
        value.exclude = exclude;
        return new FilterClause(value);
    }
    evaluate(now, maxTime, timezone) {
        if (!this.relative)
            return this;
        return this.changeSelection(plywood_1.r(FilterClause.evaluate(this.selection, now, maxTime, timezone)));
    }
}
FilterClause.NOW_REF_NAME = 'n';
FilterClause.MAX_TIME_REF_NAME = 'm';
exports.FilterClause = FilterClause;
check = FilterClause;
