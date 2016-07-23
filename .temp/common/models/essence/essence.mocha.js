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
const chai_1 = require('chai');
const tester_1 = require('immutable-class/build/tester');
const plywood_1 = require('plywood');
const index_1 = require("../../manifests/index");
const essence_1 = require('./essence');
const data_cube_1 = require("../data-cube/data-cube");
describe('Essence', () => {
    var dataCubeJS = {
        name: 'twitter',
        title: 'Twitter',
        clusterName: 'druid',
        source: 'twitter',
        introspection: 'none',
        dimensions: [
            {
                kind: 'time',
                name: 'time',
                title: 'Time',
                formula: '$time'
            },
            {
                kind: 'string',
                name: 'twitterHandle',
                title: 'Twitter Handle',
                formula: '$twitterHandle'
            }
        ],
        measures: [
            {
                name: 'count',
                title: 'count',
                formula: '$main.count()'
            }
        ],
        timeAttribute: 'time',
        defaultTimezone: 'Etc/UTC',
        defaultFilter: { op: 'literal', value: true },
        defaultDuration: 'P3D',
        defaultSortMeasure: 'count',
        defaultPinnedDimensions: ['twitterHandle'],
        refreshRule: {
            rule: "fixed",
            time: new Date('2015-09-13T00:00:00Z')
        }
    };
    var dataCube = data_cube_1.DataCube.fromJS(dataCubeJS);
    var context = { dataCube: dataCube, visualizations: index_1.MANIFESTS };
    it('is an immutable class', () => {
        tester_1.testImmutableClass(essence_1.Essence, [
            {
                visualization: 'totals',
                timezone: 'Etc/UTC',
                filter: {
                    op: "literal",
                    value: true
                },
                pinnedDimensions: [],
                singleMeasure: 'count',
                selectedMeasures: [],
                splits: []
            },
            {
                visualization: 'totals',
                timezone: 'Etc/UTC',
                filter: plywood_1.$('twitterHandle').overlap(['A', 'B', 'C']).toJS(),
                pinnedDimensions: ['twitterHandle'],
                singleMeasure: 'count',
                selectedMeasures: ['count'],
                splits: []
            }
        ], { context: context });
    });
    describe('errors', () => {
        it('must have context', () => {
            chai_1.expect(() => {
                essence_1.Essence.fromJS({});
            }).to.throw('must have context');
        });
    });
    describe('upgrades', () => {
        it('works in the base case', () => {
            var essence = essence_1.Essence.fromJS({
                visualization: 'totals',
                timezone: 'Etc/UTC',
                pinnedDimensions: [],
                selectedMeasures: [],
                splits: []
            }, context);
            chai_1.expect(essence.toJS()).to.deep.equal({
                "filter": {
                    "action": {
                        "action": "in",
                        "expression": {
                            "action": {
                                "action": "timeRange",
                                "duration": "P3D",
                                "step": -1
                            },
                            "expression": {
                                "name": "m",
                                "op": "ref"
                            },
                            "op": "chain"
                        }
                    },
                    "expression": {
                        "name": "time",
                        "op": "ref"
                    },
                    "op": "chain"
                },
                "multiMeasureMode": true,
                "pinnedDimensions": [],
                "singleMeasure": "count",
                "selectedMeasures": [],
                "splits": [],
                "timezone": "Etc/UTC",
                "visualization": "totals"
            });
        });
        it('adds timezone', () => {
            var linkItem = essence_1.Essence.fromJS({
                visualization: 'totals',
                pinnedDimensions: ['statusCode'],
                selectedMeasures: ['count'],
                splits: [],
                filter: 'true'
            }, context);
            chai_1.expect(linkItem.toJS()).to.deep.equal({
                "filter": {
                    "op": "literal",
                    "value": true
                },
                "multiMeasureMode": true,
                "pinnedDimensions": [],
                "singleMeasure": "count",
                "selectedMeasures": [
                    "count"
                ],
                "splits": [],
                "timezone": "Etc/UTC",
                "visualization": "totals"
            });
        });
        it('handles time series', () => {
            var hashNoVis = "2/EQUQLgxg9AqgKgYWAGgN7APYAdgC5gA2AlmAKYBOAhgSsAG7UCupeY5zAvsgNoC6ybZsmAQMjAHZgU3EWMnB+MsAHcSZcgAlK4gCYEW/cYwIEgA=";
            var timeSeriesHash = `time-series/${hashNoVis}`;
            var lineChartHash = `line-chart/${hashNoVis}`;
            var barChartHash = `bar-chart/${hashNoVis}`;
            var timeSeries = essence_1.Essence.fromHash(timeSeriesHash, context);
            var lineChart = essence_1.Essence.fromHash(lineChartHash, context);
            var barChart = essence_1.Essence.fromHash(barChartHash, context);
            chai_1.expect(timeSeries.visualization).to.equal(lineChart.visualization);
            chai_1.expect(timeSeries.visualization).to.not.equal(barChart.visualization);
        });
    });
    describe('.fromDataCube', () => {
        it('works in the base case', () => {
            var essence = essence_1.Essence.fromDataCube(dataCube, context);
            chai_1.expect(essence.toJS()).to.deep.equal({
                "filter": {
                    "action": {
                        "action": "in",
                        "expression": {
                            "action": {
                                "action": "timeRange",
                                "duration": "P3D",
                                "step": -1
                            },
                            "expression": {
                                "name": "m",
                                "op": "ref"
                            },
                            "op": "chain"
                        }
                    },
                    "expression": {
                        "name": "time",
                        "op": "ref"
                    },
                    "op": "chain"
                },
                "pinnedDimensions": [
                    "twitterHandle"
                ],
                "singleMeasure": "count",
                "selectedMeasures": [
                    "count"
                ],
                "splits": [],
                "timezone": "Etc/UTC",
                "visualization": "totals"
            });
        });
    });
    describe('.toHash / #fromHash', () => {
        it("is symmetric", () => {
            var essence1 = essence_1.Essence.fromJS({
                visualization: 'totals',
                timezone: 'Etc/UTC',
                filter: {
                    op: "literal",
                    value: true
                },
                pinnedDimensions: ['twitterHandle'],
                selectedMeasures: ['count'],
                splits: []
            }, context);
            var hash = essence1.toHash();
            var essence2 = essence_1.Essence.fromHash(hash, context);
            chai_1.expect(essence1.toJS()).to.deep.equal(essence2.toJS());
        });
    });
});
