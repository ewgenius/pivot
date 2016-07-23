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
const totals_1 = require('./totals/totals');
const table_1 = require('./table/table');
const line_chart_1 = require('./line-chart/line-chart');
const bar_chart_1 = require('./bar-chart/bar-chart');
const geo_1 = require('./geo/geo');
const VIS_COMPONENTS = [
    totals_1.Totals,
    table_1.Table,
    line_chart_1.LineChart,
    bar_chart_1.BarChart,
    geo_1.Geo
];
function getVisualizationComponent(manifest) {
    var manifestName = manifest.name;
    return plywood_1.helper.find(VIS_COMPONENTS, (v) => v.id === manifestName);
}
exports.getVisualizationComponent = getVisualizationComponent;
