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
const lz_string_1 = require('lz-string');
const immutable_class_1 = require('immutable-class');
const chronoshift_1 = require('chronoshift');
const plywood_1 = require('plywood');
const general_1 = require('../../../common/utils/general/general');
const filter_1 = require('../filter/filter');
const filter_clause_1 = require('../filter-clause/filter-clause');
const highlight_1 = require('../highlight/highlight');
const splits_1 = require('../splits/splits');
const colors_1 = require('../colors/colors');
const manifest_1 = require('../manifest/manifest');
const HASH_VERSION = 2;
function constrainDimensions(dimensions, dataCube) {
    return dimensions.filter((dimensionName) => Boolean(dataCube.getDimension(dimensionName)));
}
function constrainMeasures(measures, dataCube) {
    return measures.filter((measureName) => Boolean(dataCube.getMeasure(measureName)));
}
function addToSetInOrder(order, setToAdd, thing) {
    return immutable_1.OrderedSet(order.toArray().filter((name) => setToAdd.has(name) || name === thing));
}
/**
 * FairGame   - Run all visualizations pretending that there is no current
 * UnfairGame - Run all visualizations but mark current vis as current
 * KeepAlways - Just keep the current one
 */
(function (VisStrategy) {
    VisStrategy[VisStrategy["FairGame"] = 0] = "FairGame";
    VisStrategy[VisStrategy["UnfairGame"] = 1] = "UnfairGame";
    VisStrategy[VisStrategy["KeepAlways"] = 2] = "KeepAlways";
})(exports.VisStrategy || (exports.VisStrategy = {}));
var VisStrategy = exports.VisStrategy;
var check;
class Essence {
    constructor(parameters) {
        var { visualizations, dataCube, visualization, timezone, filter, splits, multiMeasureMode, singleMeasure, selectedMeasures, pinnedDimensions, colors, pinnedSort, compare, highlight } = parameters;
        if (!dataCube)
            throw new Error('Essence must have a dataCube');
        timezone = timezone || chronoshift_1.Timezone.UTC;
        if (!filter) {
            filter = dataCube.getDefaultFilter();
        }
        multiMeasureMode = Boolean(multiMeasureMode);
        function visibleMeasure(measureName) {
            return multiMeasureMode ? selectedMeasures.has(measureName) : measureName === singleMeasure;
        }
        // Wipe out the highlight if measure is not selected
        if (highlight && highlight.measure && !visibleMeasure(highlight.measure)) {
            highlight = null;
        }
        if (visualizations) {
            // Place vis here because it needs to know about splits and colors (and maybe later other things)
            if (!visualization) {
                var visAndResolve = Essence.getBestVisualization(visualizations, dataCube, splits, colors, null);
                visualization = visAndResolve.visualization;
            }
            var visResolve = visualization.handleCircumstance(dataCube, splits, colors, true);
            if (visResolve.isAutomatic()) {
                var adjustment = visResolve.adjustment;
                splits = adjustment.splits;
                colors = adjustment.colors || null;
                visResolve = visualization.handleCircumstance(dataCube, splits, colors, true);
                if (!visResolve.isReady()) {
                    console.log(visResolve);
                    throw new Error(visualization.title + ' must be ready after automatic adjustment');
                }
            }
        }
        this.visualizations = visualizations;
        this.dataCube = dataCube;
        this.visualization = visualization;
        this.dataCube = dataCube;
        this.timezone = timezone;
        this.filter = filter;
        this.splits = splits;
        this.multiMeasureMode = multiMeasureMode;
        this.singleMeasure = singleMeasure;
        this.selectedMeasures = selectedMeasures;
        this.pinnedDimensions = pinnedDimensions;
        this.colors = colors;
        this.pinnedSort = pinnedSort;
        this.highlight = highlight;
        this.compare = compare;
        this.visResolve = visResolve;
    }
    static isEssence(candidate) {
        return immutable_class_1.isInstanceOf(candidate, Essence);
    }
    static getBestVisualization(visualizations, dataCube, splits, colors, currentVisualization) {
        var visAndResolves = visualizations.map((visualization) => {
            return {
                visualization: visualization,
                resolve: visualization.handleCircumstance(dataCube, splits, colors, visualization === currentVisualization)
            };
        });
        return visAndResolves.sort((vr1, vr2) => manifest_1.Resolve.compare(vr1.resolve, vr2.resolve))[0];
    }
    static fromHash(hash, context) {
        var parts = hash.split('/');
        if (parts.length < 3)
            return null;
        var visualization = parts.shift();
        var version = parseInt(parts.shift(), 10);
        if (version > HASH_VERSION)
            return null;
        var jsArray = null;
        try {
            jsArray = JSON.parse('[' + lz_string_1.decompressFromBase64(parts.join('/')) + ']');
        }
        catch (e) {
            return null;
        }
        if (!Array.isArray(jsArray))
            return null;
        if (version === 1) {
            jsArray.splice(3, 0, false, null); // Insert null at position 3 (between splits and selectedMeasures)
        }
        var jsArrayLength = jsArray.length;
        if (!(8 <= jsArrayLength && jsArrayLength <= 11))
            return null;
        var essence;
        try {
            essence = Essence.fromJS({
                visualization: visualization,
                timezone: jsArray[0],
                filter: jsArray[1],
                splits: jsArray[2],
                multiMeasureMode: jsArray[3],
                singleMeasure: jsArray[4],
                selectedMeasures: jsArray[5],
                pinnedDimensions: jsArray[6],
                pinnedSort: jsArray[7],
                colors: jsArray[8] || null,
                compare: jsArray[9] || null,
                highlight: jsArray[10] || null
            }, context);
        }
        catch (e) {
            return null;
        }
        return essence;
    }
    static fromDataCube(dataCube, context) {
        var splits = splits_1.Splits.EMPTY;
        var { defaultSplits } = dataCube.options;
        if (defaultSplits) {
            splits = splits_1.Splits.fromJS(defaultSplits, dataCube);
        }
        var essence = new Essence({
            dataCube: context.dataCube,
            visualizations: context.visualizations,
            visualization: null,
            timezone: dataCube.getDefaultTimezone(),
            filter: null,
            splits: splits,
            multiMeasureMode: false,
            singleMeasure: dataCube.getDefaultSortMeasure(),
            selectedMeasures: dataCube.getDefaultSelectedMeasures(),
            pinnedDimensions: dataCube.getDefaultPinnedDimensions(),
            colors: null,
            pinnedSort: dataCube.getDefaultSortMeasure(),
            compare: null,
            highlight: null
        });
        if (defaultSplits) {
            essence = essence.updateSplitsWithFilter();
        }
        return essence;
    }
    static fromJS(parameters, context) {
        if (!context)
            throw new Error('Essence must have context');
        const { dataCube, visualizations } = context;
        var visualizationName = parameters.visualization;
        if (visualizationName === 'time-series')
            visualizationName = 'line-chart'; // Back compat (used to be named time-series)
        var visualization = plywood_1.helper.findByName(visualizations, visualizationName);
        var timezone = parameters.timezone ? chronoshift_1.Timezone.fromJS(parameters.timezone) : null;
        var filter = parameters.filter ? filter_1.Filter.fromJS(parameters.filter).constrainToDimensions(dataCube.dimensions, dataCube.timeAttribute) : null;
        var splits = splits_1.Splits.fromJS(parameters.splits || [], dataCube).constrainToDimensionsAndMeasures(dataCube.dimensions, dataCube.measures);
        var defaultSortMeasureName = dataCube.getDefaultSortMeasure();
        var multiMeasureMode = general_1.hasOwnProperty(parameters, 'multiMeasureMode') ? parameters.multiMeasureMode : !general_1.hasOwnProperty(parameters, 'singleMeasure');
        var singleMeasure = dataCube.getMeasure(parameters.singleMeasure) ? parameters.singleMeasure : defaultSortMeasureName;
        var selectedMeasures = constrainMeasures(immutable_1.OrderedSet(parameters.selectedMeasures || []), dataCube);
        var pinnedDimensions = constrainDimensions(immutable_1.OrderedSet(parameters.pinnedDimensions || []), dataCube);
        var colors = parameters.colors ? colors_1.Colors.fromJS(parameters.colors) : null;
        var pinnedSort = dataCube.getMeasure(parameters.pinnedSort) ? parameters.pinnedSort : defaultSortMeasureName;
        var compare = null;
        var compareJS = parameters.compare;
        if (compareJS) {
            compare = filter_1.Filter.fromJS(compareJS).constrainToDimensions(dataCube.dimensions, dataCube.timeAttribute);
        }
        var highlight = null;
        var highlightJS = parameters.highlight;
        if (highlightJS) {
            highlight = highlight_1.Highlight.fromJS(highlightJS).constrainToDimensions(dataCube.dimensions, dataCube.timeAttribute);
        }
        return new Essence({
            dataCube: dataCube,
            visualizations: visualizations,
            visualization: visualization,
            timezone: timezone,
            filter: filter,
            splits: splits,
            multiMeasureMode: multiMeasureMode,
            singleMeasure: singleMeasure,
            selectedMeasures: selectedMeasures,
            pinnedDimensions: pinnedDimensions,
            colors: colors,
            pinnedSort: pinnedSort,
            compare: compare,
            highlight: highlight
        });
    }
    valueOf() {
        return {
            dataCube: this.dataCube,
            visualizations: this.visualizations,
            visualization: this.visualization,
            timezone: this.timezone,
            filter: this.filter,
            splits: this.splits,
            multiMeasureMode: this.multiMeasureMode,
            singleMeasure: this.singleMeasure,
            selectedMeasures: this.selectedMeasures,
            pinnedDimensions: this.pinnedDimensions,
            colors: this.colors,
            pinnedSort: this.pinnedSort,
            compare: this.compare,
            highlight: this.highlight
        };
    }
    toJS() {
        var js = {
            visualization: this.visualization.name,
            timezone: this.timezone.toJS(),
            filter: this.filter.toJS(),
            splits: this.splits.toJS(),
            singleMeasure: this.singleMeasure,
            selectedMeasures: this.selectedMeasures.toArray(),
            pinnedDimensions: this.pinnedDimensions.toArray()
        };
        if (this.multiMeasureMode)
            js.multiMeasureMode = true;
        if (this.colors)
            js.colors = this.colors.toJS();
        var defaultSortMeasure = this.dataCube.getDefaultSortMeasure();
        if (this.pinnedSort !== defaultSortMeasure)
            js.pinnedSort = this.pinnedSort;
        if (this.compare)
            js.compare = this.compare.toJS();
        if (this.highlight)
            js.highlight = this.highlight.toJS();
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[Essence]`;
    }
    equals(other) {
        return Essence.isEssence(other) &&
            this.dataCube.equals(other.dataCube) &&
            this.visualization.name === other.visualization.name &&
            this.timezone.equals(other.timezone) &&
            this.filter.equals(other.filter) &&
            this.splits.equals(other.splits) &&
            this.multiMeasureMode === other.multiMeasureMode &&
            this.singleMeasure === other.singleMeasure &&
            this.selectedMeasures.equals(other.selectedMeasures) &&
            this.pinnedDimensions.equals(other.pinnedDimensions) &&
            immutable_class_1.immutableEqual(this.colors, other.colors) &&
            this.pinnedSort === other.pinnedSort &&
            immutable_class_1.immutableEqual(this.compare, other.compare) &&
            immutable_class_1.immutableEqual(this.highlight, other.highlight);
    }
    toHash() {
        var js = this.toJS();
        var compressed = [
            js.timezone,
            js.filter,
            js.splits,
            js.multiMeasureMode,
            js.singleMeasure,
            js.selectedMeasures,
            js.pinnedDimensions,
            js.pinnedSort // 7
        ];
        if (js.colors)
            compressed[8] = js.colors;
        if (js.compare)
            compressed[9] = js.compare;
        if (js.highlight)
            compressed[10] = js.highlight;
        var restJSON = [];
        for (var i = 0; i < compressed.length; i++) {
            restJSON.push(JSON.stringify(compressed[i] || null));
        }
        return [
            js.visualization,
            HASH_VERSION,
            lz_string_1.compressToBase64(restJSON.join(','))
        ].join('/');
    }
    getURL(urlPrefix) {
        return urlPrefix + this.toHash();
    }
    getTimeAttribute() {
        return this.dataCube.timeAttribute;
    }
    getTimeDimension() {
        return this.dataCube.getTimeDimension();
    }
    evaluateSelection(selection, now = new Date()) {
        var { dataCube, timezone } = this;
        var maxTime = dataCube.getMaxTimeDate();
        return filter_clause_1.FilterClause.evaluate(selection, now, maxTime, timezone);
    }
    evaluateClause(clause, now = new Date()) {
        var { dataCube, timezone } = this;
        var maxTime = dataCube.getMaxTimeDate();
        return clause.evaluate(now, maxTime, timezone);
    }
    getEffectiveFilter(highlightId = null, unfilterDimension = null) {
        var { dataCube, filter, highlight, timezone } = this;
        if (highlight && (highlightId !== highlight.owner))
            filter = highlight.applyToFilter(filter);
        if (unfilterDimension)
            filter = filter.remove(unfilterDimension.expression);
        var maxTime = dataCube.getMaxTimeDate();
        return filter.getSpecificFilter(new Date(), maxTime, timezone);
    }
    getTimeSelection() {
        const timeAttribute = this.getTimeAttribute();
        return this.filter.getSelection(timeAttribute);
    }
    isFixedMeasureMode() {
        return this.visualization.measureModeNeed !== 'any';
    }
    getEffectiveMultiMeasureMode() {
        const { measureModeNeed } = this.visualization;
        if (measureModeNeed !== 'any') {
            return measureModeNeed === 'multi';
        }
        return this.multiMeasureMode;
    }
    getEffectiveMeasures() {
        if (this.getEffectiveMultiMeasureMode()) {
            return this.getMeasures();
        }
        else {
            return immutable_1.List([this.dataCube.getMeasure(this.singleMeasure)]);
        }
    }
    getMeasures() {
        var dataCube = this.dataCube;
        return this.selectedMeasures.toList().map(measureName => dataCube.getMeasure(measureName));
    }
    getEffectiveSelectedMeasure() {
        if (this.getEffectiveMultiMeasureMode()) {
            return this.selectedMeasures;
        }
        else {
            return immutable_1.OrderedSet([this.singleMeasure]);
        }
    }
    differentDataCube(other) {
        return this.dataCube !== other.dataCube;
    }
    differentTimezone(other) {
        return !this.timezone.equals(other.timezone);
    }
    differentTimezoneMatters(other) {
        return this.splits.timezoneDependant() && this.differentTimezone(other);
    }
    differentFilter(other) {
        return !this.filter.equals(other.filter);
    }
    differentSplits(other) {
        return !this.splits.equals(other.splits);
    }
    differentEffectiveSplits(other) {
        return this.differentSplits(other) || this.differentTimezoneMatters(other);
    }
    differentColors(other) {
        if (Boolean(this.colors) !== Boolean(other.colors))
            return true;
        if (!this.colors)
            return false;
        return !this.colors.equals(other.colors);
    }
    differentSelectedMeasures(other) {
        return !this.selectedMeasures.equals(other.selectedMeasures);
    }
    differentEffectiveMeasures(other) {
        return !this.getEffectiveSelectedMeasure().equals(other.getEffectiveSelectedMeasure());
    }
    newSelectedMeasures(other) {
        return !this.selectedMeasures.isSubset(other.selectedMeasures);
    }
    newEffectiveMeasures(other) {
        return !this.getEffectiveSelectedMeasure().isSubset(other.getEffectiveSelectedMeasure());
    }
    differentPinnedDimensions(other) {
        return !this.pinnedDimensions.equals(other.pinnedDimensions);
    }
    differentPinnedSort(other) {
        return this.pinnedSort !== other.pinnedSort;
    }
    differentCompare(other) {
        if (Boolean(this.compare) !== Boolean(other.compare))
            return true;
        return Boolean(this.compare && !this.compare.equals(other.compare));
    }
    differentHighligh(other) {
        if (Boolean(this.highlight) !== Boolean(other.highlight))
            return true;
        return Boolean(this.highlight && !this.highlight.equals(other.highlight));
    }
    differentEffectiveFilter(other, highlightId = null, unfilterDimension = null) {
        var myEffectiveFilter = this.getEffectiveFilter(highlightId, unfilterDimension);
        var otherEffectiveFilter = other.getEffectiveFilter(highlightId, unfilterDimension);
        return !myEffectiveFilter.equals(otherEffectiveFilter);
    }
    highlightOn(owner, measure) {
        var { highlight } = this;
        if (!highlight)
            return false;
        return highlight.owner === owner && (!measure || highlight.measure === measure);
    }
    highlightOnDifferentMeasure(owner, measure) {
        var { highlight } = this;
        if (!highlight)
            return false;
        return highlight.owner === owner && measure && highlight.measure !== measure;
    }
    getSingleHighlightSet() {
        var { highlight } = this;
        if (!highlight)
            return null;
        return highlight.delta.getSingleClauseSet();
    }
    getApplyForSort(sort) {
        var sortOn = sort.expression.name;
        var sortMeasure = this.dataCube.getMeasure(sortOn);
        if (!sortMeasure)
            return null;
        return sortMeasure.toApplyAction();
    }
    getCommonSort() {
        return this.splits.getCommonSort(this.dataCube.dimensions);
    }
    updateDataCube(newDataCube) {
        var { dataCube, visualizations } = this;
        if (dataCube.equals(newDataCube))
            return this; // nothing to do
        if (dataCube.equalsWithoutMaxTime(newDataCube)) {
            var value = this.valueOf();
            value.dataCube = newDataCube;
            return new Essence(value);
        }
        var value = this.valueOf();
        value.dataCube = newDataCube;
        // Make sure that all the elements of state are still valid
        value.filter = value.filter.constrainToDimensions(newDataCube.dimensions, newDataCube.timeAttribute, dataCube.timeAttribute);
        value.splits = value.splits.constrainToDimensionsAndMeasures(newDataCube.dimensions, newDataCube.measures);
        value.selectedMeasures = constrainMeasures(value.selectedMeasures, newDataCube);
        if (value.selectedMeasures.size === 0) {
            value.selectedMeasures = newDataCube.getDefaultSelectedMeasures();
        }
        value.pinnedDimensions = constrainDimensions(value.pinnedDimensions, newDataCube);
        if (value.colors && !newDataCube.getDimension(value.colors.dimension)) {
            value.colors = null;
        }
        if (!newDataCube.getMeasure(value.pinnedSort))
            value.pinnedSort = newDataCube.getDefaultSortMeasure();
        if (value.compare) {
            value.compare = value.compare.constrainToDimensions(newDataCube.dimensions, newDataCube.timeAttribute);
        }
        if (value.highlight) {
            value.highlight = value.highlight.constrainToDimensions(newDataCube.dimensions, newDataCube.timeAttribute);
        }
        return new Essence(value);
    }
    // Modification
    changeFilter(filter, removeHighlight = false) {
        var value = this.valueOf();
        value.filter = filter;
        if (removeHighlight) {
            value.highlight = null;
        }
        var differentAttributes = filter.getDifferentAttributes(this.filter);
        value.splits = value.splits.removeBucketingFrom(differentAttributes);
        return (new Essence(value)).updateSplitsWithFilter();
    }
    changeTimezone(newTimezone) {
        var { timezone } = this;
        if (timezone === newTimezone)
            return this;
        var value = this.valueOf();
        value.timezone = newTimezone;
        return new Essence(value);
    }
    changeTimeSelection(check) {
        var { filter } = this;
        var timeAttribute = this.getTimeAttribute();
        return this.changeFilter(filter.setSelection(timeAttribute, check));
    }
    convertToSpecificFilter() {
        var { dataCube, filter, timezone } = this;
        if (!filter.isRelative())
            return this;
        var maxTime = dataCube.getMaxTimeDate();
        return this.changeFilter(filter.getSpecificFilter(new Date(), maxTime, timezone));
    }
    changeSplits(splits, strategy) {
        var { visualizations, dataCube, visualization, visResolve, colors } = this;
        splits = splits.updateWithFilter(this.getEffectiveFilter(), dataCube.dimensions);
        // If in manual mode stay there, keep the vis regardless of suggested strategy
        if (visResolve.isManual()) {
            strategy = VisStrategy.KeepAlways;
        }
        if (strategy !== VisStrategy.KeepAlways) {
            var visAndResolve = Essence.getBestVisualization(visualizations, dataCube, splits, colors, (strategy === VisStrategy.FairGame ? null : visualization));
            visualization = visAndResolve.visualization;
        }
        var value = this.valueOf();
        value.splits = splits;
        value.visualization = visualization;
        if (value.highlight) {
            value.filter = value.highlight.applyToFilter(value.filter);
            value.highlight = null;
        }
        return new Essence(value);
    }
    changeSplit(splitCombine, strategy) {
        return this.changeSplits(splits_1.Splits.fromSplitCombine(splitCombine), strategy);
    }
    addSplit(split, strategy) {
        var { splits } = this;
        return this.changeSplits(splits.addSplit(split), strategy);
    }
    removeSplit(split, strategy) {
        var { splits } = this;
        return this.changeSplits(splits.removeSplit(split), strategy);
    }
    updateSplitsWithFilter() {
        var value = this.valueOf();
        value.splits = value.splits.updateWithFilter(this.getEffectiveFilter(), this.dataCube.dimensions);
        return new Essence(value);
    }
    changeColors(colors) {
        var value = this.valueOf();
        value.colors = colors;
        return new Essence(value);
    }
    changeVisualization(visualization) {
        var value = this.valueOf();
        value.visualization = visualization;
        return new Essence(value);
    }
    pin(dimension) {
        var value = this.valueOf();
        value.pinnedDimensions = value.pinnedDimensions.add(dimension.name);
        return new Essence(value);
    }
    unpin(dimension) {
        var value = this.valueOf();
        value.pinnedDimensions = value.pinnedDimensions.remove(dimension.name);
        return new Essence(value);
    }
    getPinnedSortMeasure() {
        return this.dataCube.getMeasure(this.pinnedSort);
    }
    changePinnedSortMeasure(measure) {
        var value = this.valueOf();
        value.pinnedSort = measure.name;
        return new Essence(value);
    }
    toggleMultiMeasureMode() {
        const { dataCube, multiMeasureMode, selectedMeasures, singleMeasure } = this;
        var value = this.valueOf();
        value.multiMeasureMode = !multiMeasureMode;
        if (multiMeasureMode) {
            // Ensure that the singleMeasure is in the selectedMeasures
            if (selectedMeasures.size && !selectedMeasures.has(singleMeasure)) {
                value.singleMeasure = selectedMeasures.first();
            }
        }
        else {
            value.selectedMeasures = addToSetInOrder(dataCube.measures.map(m => m.name), value.selectedMeasures, singleMeasure);
        }
        return new Essence(value);
    }
    changeSingleMeasure(measure) {
        if (measure.name === this.singleMeasure)
            return this;
        var value = this.valueOf();
        value.singleMeasure = measure.name;
        value.splits = value.splits.changeSortIfOnMeasure(this.singleMeasure, measure.name);
        value.pinnedSort = measure.name;
        return new Essence(value);
    }
    toggleSelectedMeasure(measure) {
        var dataCube = this.dataCube;
        var value = this.valueOf();
        var selectedMeasures = value.selectedMeasures;
        var measureName = measure.name;
        if (selectedMeasures.has(measureName)) {
            value.selectedMeasures = selectedMeasures.delete(measureName);
        }
        else {
            value.selectedMeasures = addToSetInOrder(dataCube.measures.map(m => m.name), selectedMeasures, measureName);
        }
        return new Essence(value);
    }
    toggleEffectiveMeasure(measure) {
        if (this.getEffectiveMultiMeasureMode()) {
            return this.toggleSelectedMeasure(measure);
        }
        else {
            return this.changeSingleMeasure(measure);
        }
    }
    acceptHighlight() {
        var { highlight } = this;
        if (!highlight)
            return this;
        return this.changeFilter(highlight.applyToFilter(this.filter), true);
    }
    changeHighlight(owner, measure, delta) {
        var { highlight } = this;
        // If there is already a highlight from someone else accept it
        var value;
        if (highlight && highlight.owner !== owner) {
            value = this.changeFilter(highlight.applyToFilter(this.filter)).valueOf();
        }
        else {
            value = this.valueOf();
        }
        value.highlight = new highlight_1.Highlight({
            owner: owner,
            delta: delta,
            measure: measure
        });
        return new Essence(value);
    }
    dropHighlight() {
        var value = this.valueOf();
        value.highlight = null;
        return new Essence(value);
    }
}
exports.Essence = Essence;
check = Essence;
