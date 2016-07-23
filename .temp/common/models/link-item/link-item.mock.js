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
const index_1 = require("../../manifests/index");
const data_cube_mock_1 = require("../data-cube/data-cube.mock");
const link_item_1 = require('./link-item');
class LinkItemMock {
    static testOneJS() {
        return {
            name: 'test1',
            title: 'Test One',
            description: 'I like testing',
            group: 'Tests',
            dataCube: 'wiki',
            essence: {
                visualization: 'totals',
                timezone: 'Etc/UTC',
                filter: {
                    op: "literal",
                    value: true
                },
                pinnedDimensions: ['articleName'],
                singleMeasure: "count",
                selectedMeasures: ['count'],
                splits: []
            }
        };
    }
    static testTwoJS() {
        return {
            name: 'test2',
            title: 'Test Two',
            description: 'I like testing',
            group: 'Tests',
            dataCube: 'wiki',
            essence: {
                visualization: 'totals',
                timezone: 'Etc/UTC',
                filter: plywood_1.$('time').in(new Date('2015-01-01Z'), new Date('2016-01-01Z')).toJS(),
                pinnedDimensions: [],
                singleMeasure: "count",
                selectedMeasures: ['count'],
                splits: []
            }
        };
    }
    static getContext() {
        return {
            dataCubes: [data_cube_mock_1.DataCubeMock.wiki()],
            visualizations: index_1.MANIFESTS
        };
    }
    static testOne() {
        return link_item_1.LinkItem.fromJS(LinkItemMock.testOneJS(), LinkItemMock.getContext());
    }
    static testTwo() {
        return link_item_1.LinkItem.fromJS(LinkItemMock.testTwoJS(), LinkItemMock.getContext());
    }
}
exports.LinkItemMock = LinkItemMock;
