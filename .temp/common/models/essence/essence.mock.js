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
const index_1 = require("../../manifests/index");
const essence_1 = require('./essence');
const data_cube_mock_1 = require("../data-cube/data-cube.mock");
const split_combine_mock_1 = require("../split-combine/split-combine.mock");
class EssenceMock {
    static wikiTotalsJS() {
        return {
            visualization: 'totals',
            timezone: 'Etc/UTC',
            pinnedDimensions: [],
            selectedMeasures: [],
            splits: []
        };
    }
    static wikiLineChartJS() {
        return {
            visualization: 'line-chart',
            timezone: 'Etc/UTC',
            pinnedDimensions: [],
            selectedMeasures: [],
            splits: [split_combine_mock_1.SplitCombineMock.TIME_JS]
        };
    }
    static wikiLineChartNoSplitJS() {
        return {
            visualization: 'line-chart',
            timezone: 'Etc/UTC',
            pinnedDimensions: [],
            selectedMeasures: [],
            splits: []
        };
    }
    static getContext() {
        return {
            dataCube: data_cube_mock_1.DataCubeMock.wiki(),
            visualizations: index_1.MANIFESTS
        };
    }
    static wikiTotals() {
        return essence_1.Essence.fromJS(EssenceMock.wikiTotalsJS(), EssenceMock.getContext());
    }
    static wikiLineChart() {
        return essence_1.Essence.fromJS(EssenceMock.wikiLineChartJS(), EssenceMock.getContext());
    }
    static wikiLineChartNoSplit() {
        return essence_1.Essence.fromJS(EssenceMock.wikiLineChartNoSplitJS(), EssenceMock.getContext());
    }
}
exports.EssenceMock = EssenceMock;
