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
const totals_1 = require('./totals/totals');
const table_1 = require('./table/table');
const line_chart_1 = require('./line-chart/line-chart');
const bar_chart_1 = require('./bar-chart/bar-chart');
const geo_1 = require('./geo/geo');
exports.MANIFESTS = [
    totals_1.TOTALS_MANIFEST,
    table_1.TABLE_MANIFEST,
    line_chart_1.LINE_CHART_MANIFEST,
    bar_chart_1.BAR_CHART_MANIFEST,
    geo_1.GEO_MANIFEST
];
