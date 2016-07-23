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
const plywood_1 = require('plywood');
const general_1 = require('../../utils/general/general');
const split_combine_1 = require('../split-combine/split-combine');
const plywood_2 = require("plywood");
const granularity_1 = require("../granularity/granularity");
function withholdSplit(splits, split, allowIndex) {
    return splits.filter((s, i) => {
        return i === allowIndex || !s.equalsByExpression(split);
    });
}
function swapSplit(splits, split, other, allowIndex) {
    return splits.map((s, i) => {
        return (i === allowIndex || !s.equalsByExpression(split)) ? s : other;
    });
}
var check;
class Splits {
    constructor(parameters) {
        this.splitCombines = parameters;
    }
    static isSplits(candidate) {
        return immutable_class_1.isInstanceOf(candidate, Splits);
    }
    static fromSplitCombine(splitCombine) {
        return new Splits(immutable_1.List([splitCombine]));
    }
    static fromJS(parameters, context) {
        if (!Array.isArray(parameters))
            parameters = [parameters];
        return new Splits(immutable_1.List(parameters.map(splitCombine => split_combine_1.SplitCombine.fromJS(splitCombine, context))));
    }
    valueOf() {
        return this.splitCombines;
    }
    toJS() {
        return this.splitCombines.toArray().map(splitCombine => splitCombine.toJS());
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return this.splitCombines.map(splitCombine => splitCombine.toString()).join(',');
    }
    equals(other) {
        return Splits.isSplits(other) &&
            general_1.immutableListsEqual(this.splitCombines, other.splitCombines);
    }
    replaceByIndex(index, replace) {
        var { splitCombines } = this;
        if (splitCombines.size === index)
            return this.insertByIndex(index, replace);
        var replacedSplit = splitCombines.get(index);
        splitCombines = splitCombines.map((s, i) => i === index ? replace : s);
        splitCombines = swapSplit(splitCombines, replace, replacedSplit, index);
        return new Splits(splitCombines);
    }
    insertByIndex(index, insert) {
        var { splitCombines } = this;
        splitCombines = splitCombines.splice(index, 0, insert);
        splitCombines = withholdSplit(splitCombines, insert, index);
        return new Splits(splitCombines);
    }
    addSplit(split) {
        var { splitCombines } = this;
        return this.insertByIndex(splitCombines.size, split);
    }
    removeSplit(split) {
        return new Splits(this.splitCombines.filter(s => s !== split));
    }
    changeSortAction(sort) {
        return new Splits(this.splitCombines.map(s => s.changeSortAction(sort)));
    }
    changeSortActionFromNormalized(sort, dimensions) {
        return new Splits(this.splitCombines.map(s => s.changeSortActionFromNormalized(sort, dimensions)));
    }
    getTitle(dimensions) {
        return this.splitCombines.map(s => s.getDimension(dimensions).title).join(', ');
    }
    length() {
        return this.splitCombines.size;
    }
    forEach(sideEffect, context) {
        return this.splitCombines.forEach(sideEffect, context);
    }
    get(index) {
        return this.splitCombines.get(index);
    }
    first() {
        return this.splitCombines.first();
    }
    last() {
        return this.splitCombines.last();
    }
    findSplitForDimension(dimension) {
        var dimensionExpression = dimension.expression;
        return this.splitCombines.find((s) => s.expression.equals(dimensionExpression));
    }
    hasSplitOn(dimension) {
        return Boolean(this.findSplitForDimension(dimension));
    }
    replace(search, replace) {
        return new Splits(this.splitCombines.map((s) => s.equals(search) ? replace : s));
    }
    map(mapper, context) {
        return new Splits(this.splitCombines.map(mapper, context));
    }
    toArray() {
        return this.splitCombines.toArray();
    }
    removeBucketingFrom(expressions) {
        var changed = false;
        var newSplitCombines = this.splitCombines.map((splitCombine) => {
            if (!splitCombine.bucketAction)
                return splitCombine;
            var splitCombineExpression = splitCombine.expression;
            if (expressions.every(ex => !ex.equals(splitCombineExpression)))
                return splitCombine;
            changed = true;
            return splitCombine.changeBucketAction(null);
        });
        return changed ? new Splits(newSplitCombines) : this;
    }
    updateWithFilter(filter, dimensions) {
        if (filter.isRelative())
            throw new Error('can not be a relative filter');
        var changed = false;
        var newSplitCombines = this.splitCombines.map((splitCombine) => {
            if (splitCombine.bucketAction)
                return splitCombine;
            var splitExpression = splitCombine.expression;
            var splitDimension = dimensions.find(d => splitExpression.equals(d.expression));
            var splitKind = splitDimension.kind;
            if (!splitDimension || !(splitKind === 'time' || splitKind === 'number'))
                return splitCombine;
            changed = true;
            var selectionSet = filter.getLiteralSet(splitExpression);
            var extent = selectionSet ? selectionSet.extent() : null;
            if (splitKind === 'time') {
                return splitCombine.changeBucketAction(new plywood_1.TimeBucketAction({
                    duration: plywood_1.TimeRange.isTimeRange(extent) ? granularity_1.getBestBucketUnitForRange(extent, false, splitDimension.bucketedBy, splitDimension.granularities) :
                        granularity_1.getDefaultGranularityForKind('time', splitDimension.bucketedBy, splitDimension.granularities).duration
                }));
            }
            else if (splitKind === 'number') {
                return splitCombine.changeBucketAction(new plywood_2.NumberBucketAction({
                    size: extent ? granularity_1.getBestBucketUnitForRange(extent, false, splitDimension.bucketedBy, splitDimension.granularities) :
                        granularity_1.getDefaultGranularityForKind('number', splitDimension.bucketedBy, splitDimension.granularities).size
                }));
            }
            throw new Error('unknown extent type');
        });
        return changed ? new Splits(newSplitCombines) : this;
    }
    constrainToDimensionsAndMeasures(dimensions, measures) {
        function validSplit(split) {
            if (!split.getDimension(dimensions))
                return false;
            if (!split.sortAction)
                return true;
            var sortRef = split.sortAction.refName();
            if (!dimensions.find(d => d.name === sortRef) && !measures.find(m => m.name === sortRef))
                return false;
            return true;
        }
        var changed = false;
        var splitCombines = [];
        this.splitCombines.forEach((split) => {
            if (validSplit(split)) {
                splitCombines.push(split);
            }
            else {
                changed = true;
            }
        });
        return changed ? new Splits(immutable_1.List(splitCombines)) : this;
    }
    timezoneDependant() {
        return this.splitCombines.some((splitCombine) => splitCombine.timezoneDependant());
    }
    changeSortIfOnMeasure(fromMeasure, toMeasure) {
        var changed = false;
        var newSplitCombines = this.splitCombines.map((splitCombine) => {
            const { sortAction } = splitCombine;
            if (!sortAction || sortAction.refName() !== fromMeasure)
                return splitCombine;
            changed = true;
            return splitCombine.changeSortAction(new plywood_1.SortAction({
                expression: plywood_1.$(toMeasure),
                direction: sortAction.direction
            }));
        });
        return changed ? new Splits(newSplitCombines) : this;
    }
    getCommonSort(dimensions) {
        var splitCombines = this.splitCombines.toArray();
        var commonSort = null;
        for (var splitCombine of splitCombines) {
            var sort = splitCombine.getNormalizedSortAction(dimensions);
            if (commonSort) {
                if (!commonSort.equals(sort))
                    return null;
            }
            else {
                commonSort = sort;
            }
        }
        return commonSort;
    }
}
exports.Splits = Splits;
check = Splits;
Splits.EMPTY = new Splits(immutable_1.List());
