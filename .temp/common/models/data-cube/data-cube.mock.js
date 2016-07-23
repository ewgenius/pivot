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
const plywood_1 = require('plywood');
const data_cube_1 = require('./data-cube');
var executor = plywood_1.basicExecutorFactory({
    datasets: {
        wiki: plywood_1.Dataset.fromJS([]),
        twitter: plywood_1.Dataset.fromJS([])
    }
});
class DataCubeMock {
    static get WIKI_JS() {
        return {
            name: 'wiki',
            title: 'Wiki',
            description: 'Wiki description',
            clusterName: 'druid',
            source: 'wiki',
            introspection: 'none',
            attributes: [
                { name: 'time', type: 'TIME' },
                { name: 'articleName', type: 'STRING' },
                { name: 'count', type: 'NUMBER', unsplitable: true, makerAction: { action: 'count' } }
            ],
            dimensions: [
                {
                    kind: 'time',
                    name: 'time',
                    title: 'Time',
                    formula: '$time'
                },
                {
                    kind: 'string',
                    name: 'articleName',
                    title: 'Article Name',
                    formula: '$articleName'
                }
            ],
            measures: [
                {
                    name: 'count',
                    title: 'Count',
                    formula: '$main.sum($count)'
                },
                {
                    name: 'added',
                    title: 'Added',
                    formula: '$main.sum($added)'
                }
            ],
            timeAttribute: 'time',
            defaultTimezone: 'Etc/UTC',
            defaultFilter: { op: 'literal', value: true },
            defaultDuration: 'P3D',
            defaultSortMeasure: 'count',
            defaultPinnedDimensions: ['articleName'],
            defaultSelectedMeasures: ['count'],
            refreshRule: {
                time: new Date('2016-04-30T12:39:51.350Z'),
                rule: "fixed"
            }
        };
    }
    static get TWITTER_JS() {
        return {
            name: 'twitter',
            title: 'Twitter',
            description: 'Twitter description should go here',
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
            defaultPinnedDimensions: ['tweet'],
            refreshRule: {
                refresh: "PT1M",
                rule: "fixed"
            }
        };
    }
    static wiki() {
        return data_cube_1.DataCube.fromJS(DataCubeMock.WIKI_JS, { executor: executor });
    }
    static twitter() {
        return data_cube_1.DataCube.fromJS(DataCubeMock.TWITTER_JS, { executor: executor });
    }
}
exports.DataCubeMock = DataCubeMock;
