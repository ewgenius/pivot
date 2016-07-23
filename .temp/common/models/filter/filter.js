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
const dimension_1 = require('../dimension/dimension');
const filter_clause_1 = require('../filter-clause/filter-clause');
function withholdClause(clauses, clause, allowIndex) {
    return clauses.filter((c, i) => {
        return i === allowIndex || !c.equals(clause);
    });
}
function swapClause(clauses, clause, other, allowIndex) {
    return clauses.map((c, i) => {
        return (i === allowIndex || !c.equals(clause)) ? c : other;
    });
}
function dateToFileString(date) {
    return date.toISOString()
        .replace('T', '_')
        .replace('Z', '')
        .replace('.000', '');
}
var check;
class Filter {
    constructor(parameters) {
        this.clauses = parameters;
    }
    static isFilter(candidate) {
        return immutable_class_1.isInstanceOf(candidate, Filter);
    }
    static fromClause(clause) {
        if (!clause)
            throw new Error('must have clause');
        return new Filter(immutable_1.List([clause]));
    }
    static fromJS(parameters) {
        var expression = plywood_1.Expression.fromJSLoose(parameters);
        var clauses = null;
        if (expression.equals(plywood_1.Expression.TRUE)) {
            clauses = [];
        }
        else {
            clauses = (expression.getExpressionPattern('and') || [expression]).map(c => filter_clause_1.FilterClause.fromExpression(c));
        }
        return new Filter(immutable_1.List(clauses));
    }
    valueOf() {
        return this.clauses;
    }
    toJS() {
        return this.toExpression().toJS();
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return this.clauses.map(clause => clause.toString()).join(' and ');
    }
    equals(other) {
        return Filter.isFilter(other) &&
            general_1.immutableListsEqual(this.clauses, other.clauses);
    }
    replaceByIndex(index, replace) {
        var { clauses } = this;
        if (clauses.size === index)
            return this.insertByIndex(index, replace);
        var replacedClause = clauses.get(index);
        clauses = clauses.map((c, i) => i === index ? replace : c);
        clauses = swapClause(clauses, replace, replacedClause, index);
        return new Filter(clauses);
    }
    insertByIndex(index, insert) {
        var { clauses } = this;
        clauses = clauses.splice(index, 0, insert);
        clauses = withholdClause(clauses, insert, index);
        return new Filter(clauses);
    }
    empty() {
        return this.clauses.size === 0;
    }
    single() {
        return this.clauses.size === 1;
    }
    length() {
        return this.clauses.size;
    }
    toExpression() {
        var clauses = this.clauses.toArray().map(clause => {
            return clause.toExpression();
        });
        switch (clauses.length) {
            case 0:
                return plywood_1.Expression.TRUE;
            case 1:
                return clauses[0];
            default:
                return plywood_1.Expression.and(clauses);
        }
    }
    isEmpty() {
        return this.clauses.isEmpty();
    }
    isRelative() {
        return this.clauses.some(clause => clause.relative);
    }
    getSpecificFilter(now, maxTime, timezone) {
        if (!this.isRelative())
            return this;
        return new Filter(this.clauses.map(c => c.evaluate(now, maxTime, timezone)));
    }
    indexOfClause(attribute) {
        return this.clauses.findIndex(clause => clause.expression.equals(attribute));
    }
    clauseForExpression(attribute) {
        return this.clauses.find(clause => clause.expression.equals(attribute));
    }
    filteredOn(attribute) {
        return this.indexOfClause(attribute) !== -1;
    }
    filteredOnValue(attribute, value) {
        var clauses = this.clauses;
        var index = this.indexOfClause(attribute);
        if (index === -1)
            return false;
        return clauses.get(index).getLiteralSet().contains(value);
    }
    addValue(attribute, value) {
        var clauses = this.clauses;
        var index = this.indexOfClause(attribute);
        if (index === -1) {
            return new Filter(clauses.concat(new filter_clause_1.FilterClause({
                expression: attribute,
                selection: plywood_1.r(plywood_1.Set.fromJS([value]))
            })));
        }
        else {
            var clause = clauses.get(index);
            var newSet = clause.getLiteralSet().add(value);
            return new Filter(clauses.splice(index, 1, clause.changeSelection(plywood_1.r(newSet))));
        }
    }
    remove(attribute) {
        var clauses = this.clauses;
        var index = this.indexOfClause(attribute);
        if (index === -1)
            return this;
        return new Filter(clauses.delete(index));
    }
    removeValue(attribute, value) {
        var clauses = this.clauses;
        var index = this.indexOfClause(attribute);
        if (index === -1)
            return this;
        var clause = clauses.get(index);
        var newSet = clause.getLiteralSet().remove(value);
        if (newSet.empty()) {
            return new Filter(clauses.delete(index));
        }
        else {
            clauses = clauses.splice(index, 1, clause.changeSelection(plywood_1.r(newSet)));
            return new Filter(clauses);
        }
    }
    toggleValue(attribute, value) {
        return this.filteredOnValue(attribute, value) ? this.removeValue(attribute, value) : this.addValue(attribute, value);
    }
    getSelection(attribute) {
        var clauses = this.clauses;
        var index = this.indexOfClause(attribute);
        if (index === -1)
            return null;
        return clauses.get(index).selection;
    }
    setSelection(attribute, selection) {
        var clauses = this.clauses;
        var index = this.indexOfClause(attribute);
        var newClause = new filter_clause_1.FilterClause({
            expression: attribute,
            selection: selection
        });
        if (index === -1) {
            clauses = clauses.push(newClause);
        }
        else {
            clauses = clauses.splice(index, 1, newClause);
        }
        return new Filter(clauses);
    }
    getExtent(attribute) {
        var clauses = this.clauses;
        var index = this.indexOfClause(attribute);
        if (index === -1)
            return null;
        return clauses.get(index).getExtent();
    }
    getFileString(timeAttribute) {
        var nonTimeClauseSize = this.clauses.size;
        const timeRange = this.getExtent(timeAttribute); // ToDo: revisit this
        const nonTimeFilters = ((nonTimeClauseSize) => {
            return nonTimeClauseSize === 0 ? "" : `_filters-${nonTimeClauseSize}`;
        });
        if (timeRange) {
            var { start, end } = timeRange;
            nonTimeClauseSize--;
            return `${dateToFileString(start)}_${dateToFileString(end)}${nonTimeFilters(nonTimeClauseSize)}`;
        }
        return nonTimeFilters(nonTimeClauseSize);
    }
    getLiteralSet(attribute) {
        var clauses = this.clauses;
        var index = this.indexOfClause(attribute);
        if (index === -1)
            return null;
        return clauses.get(index).getLiteralSet();
    }
    getClausesForDimension(dimension) {
        return this.clauses.filter((clause) => {
            return clause.expression.equals(dimension.expression);
        });
    }
    getModeForDimension(dimension) {
        var dimensionClauses = this.getClausesForDimension(dimension);
        if (dimensionClauses.size > 0) {
            let isExcluded = dimensionClauses.every(clause => clause.exclude);
            return isExcluded ? 'exclude' : 'include';
        }
        return undefined;
    }
    setClause(expression) {
        var expressionAttribute = expression.expression;
        var added = false;
        var newOperands = this.clauses.map((clause) => {
            if (clause.expression.equals(expressionAttribute)) {
                added = true;
                return expression;
            }
            else {
                return clause;
            }
        });
        if (!added) {
            newOperands = newOperands.push(expression);
        }
        return new Filter(newOperands);
    }
    applyDelta(delta) {
        var newFilter = this;
        var deltaClauses = delta.clauses;
        deltaClauses.forEach((deltaClause) => {
            newFilter = newFilter.setClause(deltaClause);
        });
        return newFilter;
    }
    getSingleClauseSet() {
        var clauses = this.clauses;
        if (clauses.size !== 1)
            return null;
        return clauses.get(0).getLiteralSet();
    }
    constrainToDimensions(dimensions, timeAttribute, oldTimeAttribute = null) {
        var hasChanged = false;
        var clauses = [];
        this.clauses.forEach((clause) => {
            var clauseExpression = clause.expression;
            if (dimension_1.Dimension.getDimensionByExpression(dimensions, clauseExpression)) {
                clauses.push(clause);
            }
            else {
                hasChanged = true;
                // Special handling for time filter
                if (timeAttribute && oldTimeAttribute && oldTimeAttribute.equals(clauseExpression)) {
                    clauses.push(new filter_clause_1.FilterClause({
                        expression: timeAttribute,
                        selection: clause.selection
                    }));
                }
            }
        });
        return hasChanged ? new Filter(immutable_1.List(clauses)) : this;
    }
    getDifferentAttributes(other) {
        var diff = [];
        this.clauses.forEach((clause) => {
            var clauseExpression = clause.expression;
            var otherClause = other.clauseForExpression(clauseExpression);
            if (!clause.equals(otherClause)) {
                diff.push(clauseExpression);
            }
        });
        return diff;
    }
    overQuery(duration, timezone, timeAttribute) {
        if (!timeAttribute)
            return this;
        return new Filter(this.clauses.map((clause) => {
            if (clause.expression.equals(timeAttribute)) {
                var timeRange = clause.getExtent();
                var newTimeRange = new plywood_1.TimeRange({
                    start: duration.shift(timeRange.start, timezone, -1),
                    end: duration.shift(timeRange.end, timezone, 1)
                });
                return clause.changeSelection(plywood_1.r(newTimeRange));
            }
            else {
                return clause;
            }
        }));
    }
    setExclusionforDimension(exclusion, dimension) {
        var clauses = this.clauses.map((clause) => {
            if (!clause.expression.equals(dimension.expression))
                return clause;
            return clause.changeExclude(exclusion);
        });
        return new Filter(clauses);
    }
}
Filter.EXCLUDED = 'exclude';
Filter.INCLUDED = 'include';
exports.Filter = Filter;
check = Filter;
Filter.EMPTY = new Filter(immutable_1.List());
