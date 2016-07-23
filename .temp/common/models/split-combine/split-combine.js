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
var check;
class SplitCombine {
    constructor(parameters) {
        this.expression = parameters.expression;
        if (!this.expression)
            throw new Error('must have expression');
        this.bucketAction = parameters.bucketAction;
        this.sortAction = parameters.sortAction;
        this.limitAction = parameters.limitAction;
    }
    static isSplitCombine(candidate) {
        return immutable_class_1.isInstanceOf(candidate, SplitCombine);
    }
    static fromExpression(expression) {
        return new SplitCombine({
            expression: expression,
            bucketAction: null,
            sortAction: null,
            limitAction: null
        });
    }
    static fromJS(parameters, context) {
        if (typeof parameters === 'string') {
            if (!context)
                throw new Error('must have context for string split');
            var dimension = context.dimensions.find(d => d.name === parameters);
            if (!dimension)
                throw new Error(`can not find dimension ${parameters}`);
            return new SplitCombine({
                expression: dimension.expression,
                bucketAction: null,
                sortAction: null,
                limitAction: null
            });
        }
        else {
            var value = {
                expression: plywood_1.Expression.fromJSLoose(parameters.expression),
                bucketAction: null,
                sortAction: null,
                limitAction: null
            };
            if (parameters.bucketAction)
                value.bucketAction = plywood_1.Action.fromJS(parameters.bucketAction);
            if (parameters.sortAction)
                value.sortAction = plywood_1.SortAction.fromJS(parameters.sortAction);
            if (parameters.limitAction)
                value.limitAction = plywood_1.LimitAction.fromJS(parameters.limitAction);
            return new SplitCombine(value);
        }
    }
    valueOf() {
        return {
            expression: this.expression,
            bucketAction: this.bucketAction,
            sortAction: this.sortAction,
            limitAction: this.limitAction
        };
    }
    toJS() {
        var js = {
            expression: this.expression.toJS()
        };
        if (this.bucketAction)
            js.bucketAction = this.bucketAction.toJS();
        if (this.sortAction)
            js.sortAction = this.sortAction.toJS();
        if (this.limitAction)
            js.limitAction = this.limitAction.toJS();
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[SplitCombine: ${this.expression}]`;
    }
    equals(other) {
        var { expression, bucketAction, sortAction, limitAction } = this;
        return SplitCombine.isSplitCombine(other) &&
            expression.equals(other.expression) &&
            Boolean(bucketAction) === Boolean(other.bucketAction) &&
            (!bucketAction || bucketAction.equals(other.bucketAction)) &&
            Boolean(sortAction) === Boolean(other.sortAction) &&
            (!sortAction || sortAction.equals(other.sortAction)) &&
            Boolean(limitAction) === Boolean(other.limitAction) &&
            (!limitAction || limitAction.equals(other.limitAction));
    }
    equalsByExpression(other) {
        var { expression } = this;
        return SplitCombine.isSplitCombine(other) && expression.equals(other.expression);
    }
    toSplitExpression() {
        var { expression, bucketAction } = this;
        if (!bucketAction)
            return expression;
        return expression.performAction(bucketAction);
    }
    toKey() {
        return this.toSplitExpression().toString();
    }
    getNormalizedSortAction(dimensions) {
        const { sortAction } = this;
        var dimension = this.getDimension(dimensions);
        if (!sortAction)
            return null;
        if (sortAction.refName() === dimension.name) {
            return sortAction.changeExpression(plywood_1.$(SplitCombine.SORT_ON_DIMENSION_PLACEHOLDER));
        }
        return sortAction;
    }
    changeBucketAction(bucketAction) {
        var value = this.valueOf();
        value.bucketAction = bucketAction;
        return new SplitCombine(value);
    }
    changeSortAction(sortAction) {
        var value = this.valueOf();
        value.sortAction = sortAction;
        return new SplitCombine(value);
    }
    changeSortActionFromNormalized(sortAction, dimensions) {
        if (sortAction.refName() === SplitCombine.SORT_ON_DIMENSION_PLACEHOLDER) {
            var dimension = dimension_1.Dimension.getDimensionByExpression(dimensions, this.expression);
            if (!dimension)
                throw new Error('can not find dimension for split');
            sortAction = sortAction.changeExpression(plywood_1.$(dimension.name));
        }
        return this.changeSortAction(sortAction);
    }
    changeLimitAction(limitAction) {
        var value = this.valueOf();
        value.limitAction = limitAction;
        return new SplitCombine(value);
    }
    changeLimit(limit) {
        var limitAction = limit === null ? null : new plywood_1.LimitAction({ limit: limit });
        return this.changeLimitAction(limitAction);
    }
    timezoneDependant() {
        const { bucketAction } = this;
        if (!bucketAction)
            return false;
        return bucketAction.needsEnvironment();
    }
    getDimension(dimensions) {
        return dimension_1.Dimension.getDimensionByExpression(dimensions, this.expression);
    }
    getTitle(dimensions) {
        var dimension = this.getDimension(dimensions);
        return (dimension ? dimension.title : '?') + this.getBucketTitle();
    }
    getBucketTitle() {
        var bucketAction = this.bucketAction;
        if (bucketAction instanceof plywood_1.TimeBucketAction) {
            return ` (${bucketAction.duration.getDescription(true)})`;
        }
        else if (bucketAction instanceof plywood_1.NumberBucketAction) {
            return ` (by ${bucketAction.size})`;
        }
        return '';
    }
}
SplitCombine.SORT_ON_DIMENSION_PLACEHOLDER = '__PIVOT_SORT_ON_DIMENSIONS__';
exports.SplitCombine = SplitCombine;
