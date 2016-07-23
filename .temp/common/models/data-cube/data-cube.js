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
const Q = require('q');
const immutable_1 = require('immutable');
const immutable_class_1 = require('immutable-class');
const chronoshift_1 = require('chronoshift');
const plywood_1 = require('plywood');
const general_1 = require('../../utils/general/general');
const time_1 = require('../../utils/time/time');
const dimension_1 = require('../dimension/dimension');
const measure_1 = require('../measure/measure');
const filter_clause_1 = require('../filter-clause/filter-clause');
const filter_1 = require('../filter/filter');
const splits_1 = require('../splits/splits');
const max_time_1 = require('../max-time/max-time');
const refresh_rule_1 = require('../refresh-rule/refresh-rule');
function formatTimeDiff(diff) {
    diff = Math.round(Math.abs(diff) / 1000); // turn to seconds
    if (diff < 60)
        return 'less than 1 minute';
    diff = Math.floor(diff / 60); // turn to minutes
    if (diff === 1)
        return '1 minute';
    if (diff < 60)
        return diff + ' minutes';
    diff = Math.floor(diff / 60); // turn to hours
    if (diff === 1)
        return '1 hour';
    if (diff <= 24)
        return diff + ' hours';
    diff = Math.floor(diff / 24); // turn to days
    return diff + ' days';
}
function checkUnique(dimensions, measures, dataCubeName) {
    var seenDimensions = {};
    var seenMeasures = {};
    if (dimensions) {
        dimensions.forEach((d) => {
            var dimensionName = d.name.toLowerCase();
            if (seenDimensions[dimensionName])
                throw new Error(`duplicate dimension name '${d.name}' found in data cube: '${dataCubeName}'`);
            seenDimensions[dimensionName] = 1;
        });
    }
    if (measures) {
        measures.forEach((m) => {
            var measureName = m.name.toLowerCase();
            if (seenMeasures[measureName])
                throw new Error(`duplicate measure name '${m.name}' found in data cube: '${dataCubeName}'`);
            if (seenDimensions[measureName])
                throw new Error(`name '${m.name}' found in both dimensions and measures in data cube: '${dataCubeName}'`);
            seenMeasures[measureName] = 1;
        });
    }
}
function measuresFromLongForm(longForm) {
    const { metricColumn, measures, possibleAggregates } = longForm;
    var myPossibleAggregates = {};
    for (var agg in possibleAggregates) {
        if (!general_1.hasOwnProperty(possibleAggregates, agg))
            continue;
        myPossibleAggregates[agg] = plywood_1.Expression.fromJSLoose(possibleAggregates[agg]);
    }
    return measures.map((measure) => {
        if (general_1.hasOwnProperty(measure, 'name')) {
            return measure_1.Measure.fromJS(measure);
        }
        var title = measure.title;
        if (!title) {
            throw new Error('must have title in longForm value');
        }
        var value = measure.value;
        var aggregate = measure.aggregate;
        if (!aggregate) {
            throw new Error('must have aggregates in longForm value');
        }
        var myExpression = myPossibleAggregates[aggregate];
        if (!myExpression)
            throw new Error(`can not find aggregate ${aggregate} for value ${value}`);
        var name = general_1.makeUrlSafeName(`${aggregate}_${value}`);
        return new measure_1.Measure({
            name: name,
            title: title,
            formula: myExpression.substitute((ex) => {
                if (ex instanceof plywood_1.RefExpression && ex.name === 'filtered') {
                    return plywood_1.$('main').filter(plywood_1.$(metricColumn).is(plywood_1.r(value)));
                }
                return null;
            }).toString()
        });
    });
}
function filterFromLongForm(longForm) {
    var { metricColumn, measures } = longForm;
    var values = [];
    for (var measure of measures) {
        if (general_1.hasOwnProperty(measure, 'aggregate'))
            values.push(measure.value);
    }
    return plywood_1.$(metricColumn).in(values).simplify();
}
var check;
class DataCube {
    constructor(parameters) {
        var name = parameters.name;
        if (typeof name !== 'string')
            throw new Error(`DataCube must have a name`);
        general_1.verifyUrlSafeName(name);
        this.name = name;
        this.title = parameters.title || general_1.makeTitle(name);
        this.description = parameters.description || '';
        this.clusterName = parameters.clusterName || 'druid';
        this.source = parameters.source || name;
        this.group = parameters.group || null;
        this.subsetFormula = parameters.subsetFormula;
        this.subsetExpression = parameters.subsetFormula ? plywood_1.Expression.fromJSLoose(parameters.subsetFormula) : plywood_1.Expression.TRUE;
        this.rollup = Boolean(parameters.rollup);
        this.options = parameters.options || {};
        this.introspection = parameters.introspection;
        this.attributes = parameters.attributes || [];
        this.attributeOverrides = parameters.attributeOverrides || [];
        this.derivedAttributes = parameters.derivedAttributes;
        this.timeAttribute = parameters.timeAttribute;
        this.defaultTimezone = parameters.defaultTimezone;
        this.defaultFilter = parameters.defaultFilter;
        this.defaultSplits = parameters.defaultSplits;
        this.defaultDuration = parameters.defaultDuration;
        this.defaultSortMeasure = parameters.defaultSortMeasure;
        this.defaultSelectedMeasures = parameters.defaultSelectedMeasures;
        this.defaultPinnedDimensions = parameters.defaultPinnedDimensions;
        var refreshRule = parameters.refreshRule || refresh_rule_1.RefreshRule.query();
        this.refreshRule = refreshRule;
        this.maxTime = parameters.maxTime || (refreshRule.isRealtime() ? max_time_1.MaxTime.fromNow() : null);
        this.cluster = parameters.cluster;
        this.executor = parameters.executor;
        var dimensions = parameters.dimensions;
        var measures = parameters.measures;
        checkUnique(dimensions, measures, name);
        this.dimensions = dimensions || immutable_1.List([]);
        this.measures = measures || immutable_1.List([]);
        this._validateDefaults();
    }
    static isDataCube(candidate) {
        return immutable_class_1.isInstanceOf(candidate, DataCube);
    }
    static updateMaxTime(dataCube) {
        if (dataCube.refreshRule.isRealtime()) {
            return Q(dataCube.changeMaxTime(max_time_1.MaxTime.fromNow()));
        }
        var ex = plywood_1.ply().apply('maxTime', plywood_1.$('main').max(dataCube.timeAttribute));
        return dataCube.executor(ex).then((dataset) => {
            var maxTimeDate = dataset.data[0]['maxTime'];
            if (!isNaN(maxTimeDate)) {
                return dataCube.changeMaxTime(max_time_1.MaxTime.fromDate(maxTimeDate));
            }
            return dataCube;
        });
    }
    static fromClusterAndExternal(name, cluster, external) {
        var dataCube = DataCube.fromJS({
            name: name,
            clusterName: cluster.name,
            source: String(external.source),
            refreshRule: refresh_rule_1.RefreshRule.query().toJS()
        });
        return dataCube.updateCluster(cluster).updateWithExternal(external);
    }
    static fromJS(parameters, context = {}) {
        const { cluster, executor } = context;
        var clusterName = parameters.clusterName;
        var introspection = parameters.introspection;
        var defaultSplitsJS = parameters.defaultSplits;
        var attributeOverrideJSs = parameters.attributeOverrides;
        // Back compat.
        if (!clusterName) {
            clusterName = parameters.engine;
        }
        var options = parameters.options || {};
        if (options.skipIntrospection) {
            if (!introspection)
                introspection = 'none';
            delete options.skipIntrospection;
        }
        if (options.disableAutofill) {
            if (!introspection)
                introspection = 'no-autofill';
            delete options.disableAutofill;
        }
        if (options.attributeOverrides) {
            if (!attributeOverrideJSs)
                attributeOverrideJSs = options.attributeOverrides;
            delete options.attributeOverrides;
        }
        if (options.defaultSplitDimension) {
            options.defaultSplits = options.defaultSplitDimension;
            delete options.defaultSplitDimension;
        }
        if (options.defaultSplits) {
            if (!defaultSplitsJS)
                defaultSplitsJS = options.defaultSplits;
            delete options.defaultSplits;
        }
        // End Back compat.
        if (introspection && DataCube.INTROSPECTION_VALUES.indexOf(introspection) === -1) {
            throw new Error(`invalid introspection value ${introspection}, must be one of ${DataCube.INTROSPECTION_VALUES.join(', ')}`);
        }
        var refreshRule = parameters.refreshRule ? refresh_rule_1.RefreshRule.fromJS(parameters.refreshRule) : null;
        var maxTime = parameters.maxTime ? max_time_1.MaxTime.fromJS(parameters.maxTime) : null;
        var timeAttributeName = parameters.timeAttribute;
        if (cluster && cluster.type === 'druid' && !timeAttributeName) {
            timeAttributeName = '__time';
        }
        var timeAttribute = timeAttributeName ? plywood_1.$(timeAttributeName) : null;
        var attributeOverrides = plywood_1.AttributeInfo.fromJSs(attributeOverrideJSs || []);
        var attributes = plywood_1.AttributeInfo.fromJSs(parameters.attributes || []);
        var derivedAttributes = null;
        if (parameters.derivedAttributes) {
            derivedAttributes = plywood_1.helper.expressionLookupFromJS(parameters.derivedAttributes);
        }
        var dimensions = immutable_1.List((parameters.dimensions || []).map((d) => dimension_1.Dimension.fromJS(d)));
        var measures = immutable_1.List((parameters.measures || []).map((m) => measure_1.Measure.fromJS(m)));
        if (timeAttribute && !dimension_1.Dimension.getDimensionByExpression(dimensions, timeAttribute)) {
            dimensions = dimensions.unshift(new dimension_1.Dimension({
                name: timeAttributeName,
                kind: 'time',
                formula: timeAttribute.toString()
            }));
        }
        var subsetFormula = parameters.subsetFormula || parameters.subsetFilter;
        var longForm = parameters.longForm;
        if (longForm) {
            measures = measures.concat(measuresFromLongForm(longForm));
            if (longForm.addSubsetFilter) {
                var subsetExpression = subsetFormula ? plywood_1.Expression.fromJSLoose(parameters.subsetFormula) : plywood_1.Expression.TRUE;
                subsetFormula = subsetExpression.and(filterFromLongForm(longForm)).simplify().toString();
            }
        }
        var value = {
            executor: null,
            name: parameters.name,
            title: parameters.title,
            description: parameters.description,
            clusterName: clusterName,
            source: parameters.source,
            group: parameters.group,
            subsetFormula: subsetFormula,
            rollup: parameters.rollup,
            options: options,
            introspection: introspection,
            attributeOverrides: attributeOverrides,
            attributes: attributes,
            derivedAttributes: derivedAttributes,
            dimensions: dimensions,
            measures: measures,
            timeAttribute: timeAttribute,
            defaultTimezone: parameters.defaultTimezone ? chronoshift_1.Timezone.fromJS(parameters.defaultTimezone) : null,
            defaultFilter: parameters.defaultFilter ? filter_1.Filter.fromJS(parameters.defaultFilter) : null,
            defaultSplits: defaultSplitsJS ? splits_1.Splits.fromJS(defaultSplitsJS, { dimensions: dimensions }) : null,
            defaultDuration: parameters.defaultDuration ? chronoshift_1.Duration.fromJS(parameters.defaultDuration) : null,
            defaultSortMeasure: parameters.defaultSortMeasure || (measures.size ? measures.first().name : null),
            defaultSelectedMeasures: parameters.defaultSelectedMeasures ? immutable_1.OrderedSet(parameters.defaultSelectedMeasures) : null,
            defaultPinnedDimensions: parameters.defaultPinnedDimensions ? immutable_1.OrderedSet(parameters.defaultPinnedDimensions) : null,
            refreshRule: refreshRule,
            maxTime: maxTime
        };
        if (cluster) {
            if (clusterName !== cluster.name)
                throw new Error(`Cluster name '${clusterName}' was given but '${cluster.name}' cluster was supplied (must match)`);
            value.cluster = cluster;
        }
        if (executor)
            value.executor = executor;
        return new DataCube(value);
    }
    valueOf() {
        var value = {
            name: this.name,
            title: this.title,
            description: this.description,
            clusterName: this.clusterName,
            source: this.source,
            group: this.group,
            subsetFormula: this.subsetFormula,
            rollup: this.rollup,
            options: this.options,
            introspection: this.introspection,
            attributeOverrides: this.attributeOverrides,
            attributes: this.attributes,
            derivedAttributes: this.derivedAttributes,
            dimensions: this.dimensions,
            measures: this.measures,
            timeAttribute: this.timeAttribute,
            defaultTimezone: this.defaultTimezone,
            defaultFilter: this.defaultFilter,
            defaultSplits: this.defaultSplits,
            defaultDuration: this.defaultDuration,
            defaultSortMeasure: this.defaultSortMeasure,
            defaultSelectedMeasures: this.defaultSelectedMeasures,
            defaultPinnedDimensions: this.defaultPinnedDimensions,
            refreshRule: this.refreshRule,
            maxTime: this.maxTime
        };
        if (this.cluster)
            value.cluster = this.cluster;
        if (this.executor)
            value.executor = this.executor;
        return value;
    }
    toJS() {
        var js = {
            name: this.name,
            title: this.title,
            description: this.description,
            clusterName: this.clusterName,
            source: this.source,
            dimensions: this.dimensions.toArray().map(dimension => dimension.toJS()),
            measures: this.measures.toArray().map(measure => measure.toJS()),
            refreshRule: this.refreshRule.toJS()
        };
        if (this.group)
            js.group = this.group;
        if (this.introspection)
            js.introspection = this.introspection;
        if (this.subsetFormula)
            js.subsetFormula = this.subsetFormula;
        if (this.defaultTimezone)
            js.defaultTimezone = this.defaultTimezone.toJS();
        if (this.defaultFilter)
            js.defaultFilter = this.defaultFilter.toJS();
        if (this.defaultSplits)
            js.defaultSplits = this.defaultSplits.toJS();
        if (this.defaultDuration)
            js.defaultDuration = this.defaultDuration.toJS();
        if (this.defaultSortMeasure)
            js.defaultSortMeasure = this.defaultSortMeasure;
        if (this.defaultSelectedMeasures)
            js.defaultSelectedMeasures = this.defaultSelectedMeasures.toArray();
        if (this.defaultPinnedDimensions)
            js.defaultPinnedDimensions = this.defaultPinnedDimensions.toArray();
        if (this.rollup)
            js.rollup = true;
        if (this.timeAttribute)
            js.timeAttribute = this.timeAttribute.name;
        if (this.attributeOverrides.length)
            js.attributeOverrides = plywood_1.AttributeInfo.toJSs(this.attributeOverrides);
        if (this.attributes.length)
            js.attributes = plywood_1.AttributeInfo.toJSs(this.attributes);
        if (this.derivedAttributes)
            js.derivedAttributes = plywood_1.helper.expressionLookupToJS(this.derivedAttributes);
        if (Object.keys(this.options).length)
            js.options = this.options;
        if (this.maxTime)
            js.maxTime = this.maxTime.toJS();
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[DataCube: ${this.name}]`;
    }
    equals(other) {
        return this.equalsWithoutMaxTime(other) &&
            Boolean(this.maxTime) === Boolean(other.maxTime) &&
            (!this.maxTime || this.maxTime.equals(other.maxTime));
    }
    equalsWithoutMaxTime(other) {
        return DataCube.isDataCube(other) &&
            this.name === other.name &&
            this.title === other.title &&
            this.description === other.description &&
            this.clusterName === other.clusterName &&
            this.source === other.source &&
            this.group === other.group &&
            this.subsetFormula === other.subsetFormula &&
            this.rollup === other.rollup &&
            JSON.stringify(this.options) === JSON.stringify(other.options) &&
            this.introspection === other.introspection &&
            immutable_class_1.immutableArraysEqual(this.attributeOverrides, other.attributeOverrides) &&
            immutable_class_1.immutableArraysEqual(this.attributes, other.attributes) &&
            immutable_class_1.immutableLookupsEqual(this.derivedAttributes, other.derivedAttributes) &&
            general_1.immutableListsEqual(this.dimensions, other.dimensions) &&
            general_1.immutableListsEqual(this.measures, other.measures) &&
            immutable_class_1.immutableEqual(this.timeAttribute, other.timeAttribute) &&
            immutable_class_1.immutableEqual(this.defaultTimezone, other.defaultTimezone) &&
            immutable_class_1.immutableEqual(this.defaultFilter, other.defaultFilter) &&
            immutable_class_1.immutableEqual(this.defaultSplits, other.defaultSplits) &&
            immutable_class_1.immutableEqual(this.defaultDuration, other.defaultDuration) &&
            this.defaultSortMeasure === other.defaultSortMeasure &&
            Boolean(this.defaultSelectedMeasures) === Boolean(other.defaultSelectedMeasures) &&
            (!this.defaultSelectedMeasures || this.defaultSelectedMeasures.equals(other.defaultSelectedMeasures)) &&
            Boolean(this.defaultPinnedDimensions) === Boolean(other.defaultPinnedDimensions) &&
            (!this.defaultPinnedDimensions || this.defaultPinnedDimensions.equals(other.defaultPinnedDimensions)) &&
            this.refreshRule.equals(other.refreshRule);
    }
    _validateDefaults() {
        var { measures, defaultSortMeasure } = this;
        if (defaultSortMeasure) {
            if (!measures.find((measure) => measure.name === defaultSortMeasure)) {
                throw new Error(`can not find defaultSortMeasure '${defaultSortMeasure}' in data cube '${this.name}'`);
            }
        }
    }
    toExternal() {
        if (this.clusterName === 'native')
            throw new Error(`there is no external on a native data cube`);
        const { cluster, options } = this;
        if (!cluster)
            throw new Error('must have a cluster');
        var externalValue = {
            engine: cluster.type,
            suppress: true,
            source: this.source,
            version: cluster.version,
            derivedAttributes: this.derivedAttributes,
            customAggregations: options.customAggregations,
            filter: this.subsetExpression
        };
        if (cluster.type === 'druid') {
            externalValue.rollup = this.rollup;
            externalValue.timeAttribute = this.timeAttribute.name;
            externalValue.introspectionStrategy = cluster.getIntrospectionStrategy();
            externalValue.allowSelectQueries = true;
            var externalContext = {
                timeout: cluster.getTimeout()
            };
            if (options.priority)
                externalContext['priority'] = options.priority;
            externalValue.context = externalContext;
        }
        if (this.introspection === 'none') {
            externalValue.attributes = plywood_1.AttributeInfo.override(this.deduceAttributes(), this.attributeOverrides);
            externalValue.derivedAttributes = this.derivedAttributes;
        }
        else {
            // ToDo: else if (we know that it will GET introspect) and there are no overrides apply special attributes as overrides
            externalValue.attributeOverrides = this.attributeOverrides;
        }
        return plywood_1.External.fromValue(externalValue);
    }
    getMainTypeContext() {
        var { attributes, derivedAttributes } = this;
        if (!attributes)
            return null;
        var datasetType = {};
        for (var attribute of attributes) {
            datasetType[attribute.name] = attribute;
        }
        for (var name in derivedAttributes) {
            datasetType[name] = {
                type: derivedAttributes[name].type
            };
        }
        return {
            type: 'DATASET',
            datasetType: datasetType
        };
    }
    getIssues() {
        var { dimensions, measures } = this;
        var mainTypeContext = this.getMainTypeContext();
        var issues = [];
        dimensions.forEach((dimension) => {
            try {
                dimension.expression.referenceCheckInTypeContext(mainTypeContext);
            }
            catch (e) {
                issues.push(`failed to validate dimension '${dimension.name}': ${e.message}`);
            }
        });
        var measureTypeContext = {
            type: 'DATASET',
            datasetType: {
                main: mainTypeContext
            }
        };
        measures.forEach((measure) => {
            try {
                measure.expression.referenceCheckInTypeContext(measureTypeContext);
            }
            catch (e) {
                var message = e.message;
                // If we get here it is possible that the user has misunderstood what the meaning of a measure is and have tried
                // to do something like $volume / $volume. We detect this here by checking for a reference to $main
                // If there is no main reference raise a more informative issue.
                if (measure.expression.getFreeReferences().indexOf('main') === -1) {
                    message = 'measure must contain a $main reference';
                }
                issues.push(`failed to validate measure '${measure.name}': ${message}`);
            }
        });
        return issues;
    }
    updateCluster(cluster) {
        var value = this.valueOf();
        value.cluster = cluster;
        return new DataCube(value);
    }
    updateWithDataset(dataset) {
        if (this.clusterName !== 'native')
            throw new Error('must be native to have a dataset');
        var executor = plywood_1.basicExecutorFactory({
            datasets: { main: dataset }
        });
        return this.addAttributes(dataset.attributes).attachExecutor(executor);
    }
    updateWithExternal(external) {
        if (this.clusterName === 'native')
            throw new Error('can not be native and have an external');
        var executor = plywood_1.basicExecutorFactory({
            datasets: { main: external }
        });
        return this.addAttributes(external.attributes).attachExecutor(executor);
    }
    attachExecutor(executor) {
        var value = this.valueOf();
        value.executor = executor;
        return new DataCube(value);
    }
    toClientDataCube() {
        var value = this.valueOf();
        // Do not reveal the subset filter to the client
        value.subsetFormula = null;
        // No need for any introspection information on the client
        value.introspection = null;
        // No point sending over the maxTime
        if (this.refreshRule.isRealtime()) {
            value.maxTime = null;
        }
        // No need for the overrides
        value.attributeOverrides = null;
        value.options = null;
        return new DataCube(value);
    }
    isQueryable() {
        return Boolean(this.executor);
    }
    getMaxTimeDate() {
        var { refreshRule } = this;
        if (refreshRule.isFixed())
            return refreshRule.time;
        // refreshRule is query or realtime
        var { maxTime } = this;
        if (!maxTime)
            return null;
        return chronoshift_1.second.ceil(maxTime.time, chronoshift_1.Timezone.UTC);
    }
    updatedText(timezone) {
        var { refreshRule } = this;
        if (refreshRule.isRealtime()) {
            return 'Updated ~1 second ago';
        }
        else if (refreshRule.isFixed()) {
            return `Fixed to ${time_1.getWallTimeString(refreshRule.time, timezone, true)}`;
        }
        else {
            var { maxTime } = this;
            if (maxTime) {
                return `Updated ${formatTimeDiff(Date.now() - maxTime.time.valueOf())} ago`;
            }
            else {
                return null;
            }
        }
    }
    shouldUpdateMaxTime() {
        if (!this.refreshRule.shouldUpdate(this.maxTime))
            return false;
        return Boolean(this.executor) || this.refreshRule.isRealtime();
    }
    getDimension(dimensionName) {
        return dimension_1.Dimension.getDimension(this.dimensions, dimensionName);
    }
    getDimensionByExpression(expression) {
        return dimension_1.Dimension.getDimensionByExpression(this.dimensions, expression);
    }
    getDimensionByKind(kind) {
        return this.dimensions.filter((d) => d.kind === kind);
    }
    getTimeDimension() {
        return this.getDimensionByExpression(this.timeAttribute);
    }
    isTimeAttribute(ex) {
        return ex.equals(this.timeAttribute);
    }
    getMeasure(measureName) {
        return measure_1.Measure.getMeasure(this.measures, measureName);
    }
    getMeasureByExpression(expression) {
        return this.measures.find(measure => measure.expression.equals(expression));
    }
    changeDimensions(dimensions) {
        var value = this.valueOf();
        value.dimensions = dimensions;
        return new DataCube(value);
    }
    rolledUp() {
        return this.clusterName === 'druid';
    }
    /**
     * This function tries to deduce the structure of the dataCube based on the dimensions and measures defined within.
     * It should only be used when, for some reason, introspection if not available.
     */
    deduceAttributes() {
        const { dimensions, measures, timeAttribute, attributeOverrides } = this;
        var attributes = [];
        if (timeAttribute) {
            attributes.push(plywood_1.AttributeInfo.fromJS({ name: timeAttribute.name, type: 'TIME' }));
        }
        dimensions.forEach((dimension) => {
            var expression = dimension.expression;
            if (expression.equals(timeAttribute))
                return;
            var references = expression.getFreeReferences();
            for (var reference of references) {
                if (plywood_1.helper.findByName(attributes, reference))
                    continue;
                attributes.push(plywood_1.AttributeInfo.fromJS({ name: reference, type: 'STRING' }));
            }
        });
        measures.forEach((measure) => {
            var expression = measure.expression;
            var references = measure_1.Measure.getAggregateReferences(expression);
            var countDistinctReferences = measure_1.Measure.getCountDistinctReferences(expression);
            for (var reference of references) {
                if (plywood_1.helper.findByName(attributes, reference))
                    continue;
                if (countDistinctReferences.indexOf(reference) !== -1) {
                    attributes.push(plywood_1.AttributeInfo.fromJS({ name: reference, special: 'unique' }));
                }
                else {
                    attributes.push(plywood_1.AttributeInfo.fromJS({ name: reference, type: 'NUMBER' }));
                }
            }
        });
        if (attributeOverrides.length) {
            attributes = plywood_1.AttributeInfo.override(attributes, attributeOverrides);
        }
        return attributes;
    }
    addAttributes(newAttributes) {
        var { dimensions, measures, attributes } = this;
        const introspection = this.getIntrospection();
        if (introspection === 'none')
            return this;
        var autofillDimensions = introspection === 'autofill-dimensions-only' || introspection === 'autofill-all';
        var autofillMeasures = introspection === 'autofill-measures-only' || introspection === 'autofill-all';
        var $main = plywood_1.$('main');
        for (var newAttribute of newAttributes) {
            var { name, type, special } = newAttribute;
            // Already exists as a current attribute
            if (attributes && plywood_1.helper.findByName(attributes, name))
                continue;
            // Already exists as a current dimension or a measure
            var urlSafeName = general_1.makeUrlSafeName(name);
            if (this.getDimension(urlSafeName) || this.getMeasure(urlSafeName))
                continue;
            var expression;
            switch (type) {
                case 'TIME':
                    if (!autofillDimensions)
                        continue;
                    expression = plywood_1.$(name);
                    if (this.getDimensionByExpression(expression))
                        continue;
                    // Add to the start
                    dimensions = dimensions.unshift(new dimension_1.Dimension({
                        name: urlSafeName,
                        kind: 'time',
                        formula: expression.toString()
                    }));
                    break;
                case 'STRING':
                    if (special === 'unique' || special === 'theta') {
                        if (!autofillMeasures)
                            continue;
                        var newMeasures = measure_1.Measure.measuresFromAttributeInfo(newAttribute);
                        newMeasures.forEach((newMeasure) => {
                            if (this.getMeasureByExpression(newMeasure.expression))
                                return;
                            measures = measures.push(newMeasure);
                        });
                    }
                    else {
                        if (!autofillDimensions)
                            continue;
                        expression = plywood_1.$(name);
                        if (this.getDimensionByExpression(expression))
                            continue;
                        dimensions = dimensions.push(new dimension_1.Dimension({
                            name: urlSafeName,
                            formula: expression.toString()
                        }));
                    }
                    break;
                case 'SET/STRING':
                    if (!autofillDimensions)
                        continue;
                    expression = plywood_1.$(name);
                    if (this.getDimensionByExpression(expression))
                        continue;
                    dimensions = dimensions.push(new dimension_1.Dimension({
                        name: urlSafeName,
                        formula: expression.toString()
                    }));
                    break;
                case 'BOOLEAN':
                    if (!autofillDimensions)
                        continue;
                    expression = plywood_1.$(name);
                    if (this.getDimensionByExpression(expression))
                        continue;
                    dimensions = dimensions.push(new dimension_1.Dimension({
                        name: urlSafeName,
                        kind: 'boolean',
                        formula: expression.toString()
                    }));
                    break;
                case 'NUMBER':
                    if (!autofillMeasures)
                        continue;
                    var newMeasures = measure_1.Measure.measuresFromAttributeInfo(newAttribute);
                    newMeasures.forEach((newMeasure) => {
                        if (this.getMeasureByExpression(newMeasure.expression))
                            return;
                        measures = (name === 'count') ? measures.unshift(newMeasure) : measures.push(newMeasure);
                    });
                    break;
                default:
                    throw new Error(`unsupported type ${type}`);
            }
        }
        if (!this.rolledUp() && !measures.find(m => m.name === 'count')) {
            measures = measures.unshift(new measure_1.Measure({
                name: 'count',
                formula: $main.count().toString()
            }));
        }
        var value = this.valueOf();
        value.attributes = attributes ? plywood_1.AttributeInfo.override(attributes, newAttributes) : newAttributes;
        value.dimensions = dimensions;
        value.measures = measures;
        if (!value.defaultSortMeasure) {
            value.defaultSortMeasure = measures.size ? measures.first().name : null;
        }
        if (!value.timeAttribute && dimensions.size && dimensions.first().kind === 'time') {
            value.timeAttribute = dimensions.first().expression;
        }
        return new DataCube(value);
    }
    getIntrospection() {
        return this.introspection || DataCube.DEFAULT_INTROSPECTION;
    }
    getDefaultTimezone() {
        return this.defaultTimezone || DataCube.DEFAULT_DEFAULT_TIMEZONE;
    }
    getDefaultFilter() {
        var filter = this.defaultFilter || DataCube.DEFAULT_DEFAULT_FILTER;
        if (this.timeAttribute) {
            filter = filter.setSelection(this.timeAttribute, plywood_1.$(filter_clause_1.FilterClause.MAX_TIME_REF_NAME).timeRange(this.getDefaultDuration(), -1));
        }
        return filter;
    }
    getDefaultSplits() {
        return this.defaultSplits || DataCube.DEFAULT_DEFAULT_SPLITS;
    }
    getDefaultDuration() {
        return this.defaultDuration || DataCube.DEFAULT_DEFAULT_DURATION;
    }
    getDefaultSortMeasure() {
        return this.defaultSortMeasure || this.measures.first().name;
    }
    getDefaultSelectedMeasures() {
        return this.defaultSelectedMeasures || immutable_1.OrderedSet(this.measures.slice(0, 4).map(m => m.name));
    }
    getDefaultPinnedDimensions() {
        return this.defaultPinnedDimensions || immutable_1.OrderedSet([]);
    }
    change(propertyName, newValue) {
        var v = this.valueOf();
        if (!v.hasOwnProperty(propertyName)) {
            throw new Error(`Unknown property : ${propertyName}`);
        }
        v[propertyName] = newValue;
        return new DataCube(v);
    }
    changeMaxTime(maxTime) {
        return this.change('maxTime', maxTime);
    }
    changeDefaultSortMeasure(defaultSortMeasure) {
        return this.change('defaultSortMeasure', defaultSortMeasure);
    }
    changeTitle(title) {
        return this.change('title', title);
    }
    changeDescription(description) {
        return this.change('description', description);
    }
    changeMeasures(measures) {
        return this.change('measures', measures);
    }
    getDefaultSortAction() {
        return new plywood_1.SortAction({
            expression: plywood_1.$(this.defaultSortMeasure),
            direction: plywood_1.SortAction.DESCENDING
        });
    }
    sameGroup(otherDataCube) {
        return Boolean(this.group && this.group === otherDataCube.group);
    }
}
DataCube.DEFAULT_INTROSPECTION = 'autofill-all';
DataCube.INTROSPECTION_VALUES = ['none', 'no-autofill', 'autofill-dimensions-only', 'autofill-measures-only', 'autofill-all'];
DataCube.DEFAULT_DEFAULT_TIMEZONE = chronoshift_1.Timezone.UTC;
DataCube.DEFAULT_DEFAULT_FILTER = filter_1.Filter.EMPTY;
DataCube.DEFAULT_DEFAULT_SPLITS = splits_1.Splits.EMPTY;
DataCube.DEFAULT_DEFAULT_DURATION = chronoshift_1.Duration.fromJS('P1D');
exports.DataCube = DataCube;
check = DataCube;
