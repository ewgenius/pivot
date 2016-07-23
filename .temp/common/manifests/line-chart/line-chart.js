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
const plywood_1 = require('plywood');
const index_1 = require('../../models/index');
const circumstances_handler_1 = require('../../utils/circumstances-handler/circumstances-handler');
const manifest_1 = require('../../models/manifest/manifest');
var handler = circumstances_handler_1.CircumstancesHandler.EMPTY()
    .when((splits, dataCube) => !(dataCube.getDimensionByKind('time') || dataCube.getDimensionByKind('number')))
    .then(() => manifest_1.Resolve.NEVER)
    .when(circumstances_handler_1.CircumstancesHandler.noSplits())
    .then((splits, dataCube) => {
    let continuousDimensions = dataCube.getDimensionByKind('time').concat(dataCube.getDimensionByKind('number'));
    return manifest_1.Resolve.manual(3, 'This visualization requires a continuous dimension split', continuousDimensions.toArray().map((continuousDimension) => {
        return {
            description: `Add a split on ${continuousDimension.title}`,
            adjustment: {
                splits: index_1.Splits.fromSplitCombine(index_1.SplitCombine.fromExpression(continuousDimension.expression))
            }
        };
    }));
})
    .when(circumstances_handler_1.CircumstancesHandler.areExactSplitKinds('time'))
    .or(circumstances_handler_1.CircumstancesHandler.areExactSplitKinds('number'))
    .then((splits, dataCube, colors, current) => {
    var score = 4;
    var continuousSplit = splits.get(0);
    var continuousDimension = dataCube.getDimensionByExpression(continuousSplit.expression);
    var sortAction = new plywood_1.SortAction({
        expression: plywood_1.$(continuousDimension.name),
        direction: plywood_1.SortAction.ASCENDING
    });
    let autoChanged = false;
    // Fix time sort
    if (!sortAction.equals(continuousSplit.sortAction)) {
        continuousSplit = continuousSplit.changeSortAction(sortAction);
        autoChanged = true;
    }
    // Fix time limit
    if (continuousSplit.limitAction && continuousDimension.kind === 'time') {
        continuousSplit = continuousSplit.changeLimitAction(null);
        autoChanged = true;
    }
    if (colors) {
        autoChanged = true;
    }
    if (continuousDimension.kind === 'time')
        score += 3;
    if (!autoChanged)
        return manifest_1.Resolve.ready(current ? 10 : score);
    return manifest_1.Resolve.automatic(score, { splits: new index_1.Splits(immutable_1.List([continuousSplit])) });
})
    .when(circumstances_handler_1.CircumstancesHandler.areExactSplitKinds('time', '*'))
    .then((splits, dataCube, colors) => {
    var timeSplit = splits.get(0);
    var timeDimension = timeSplit.getDimension(dataCube.dimensions);
    var sortAction = new plywood_1.SortAction({
        expression: plywood_1.$(timeDimension.name),
        direction: plywood_1.SortAction.ASCENDING
    });
    // Fix time sort
    if (!sortAction.equals(timeSplit.sortAction)) {
        timeSplit = timeSplit.changeSortAction(sortAction);
    }
    // Fix time limit
    if (timeSplit.limitAction) {
        timeSplit = timeSplit.changeLimitAction(null);
    }
    let colorSplit = splits.get(1);
    if (!colorSplit.sortAction) {
        colorSplit = colorSplit.changeSortAction(dataCube.getDefaultSortAction());
    }
    var colorSplitDimension = dataCube.getDimensionByExpression(colorSplit.expression);
    if (!colors || colors.dimension !== colorSplitDimension.name) {
        colors = index_1.Colors.fromLimit(colorSplitDimension.name, 5);
    }
    return manifest_1.Resolve.automatic(8, {
        splits: new index_1.Splits(immutable_1.List([colorSplit, timeSplit])),
        colors: colors
    });
})
    .when(circumstances_handler_1.CircumstancesHandler.areExactSplitKinds('*', 'time'))
    .or(circumstances_handler_1.CircumstancesHandler.areExactSplitKinds('*', 'number'))
    .then((splits, dataCube, colors) => {
    var timeSplit = splits.get(1);
    var timeDimension = timeSplit.getDimension(dataCube.dimensions);
    let autoChanged = false;
    var sortAction = new plywood_1.SortAction({
        expression: plywood_1.$(timeDimension.name),
        direction: plywood_1.SortAction.ASCENDING
    });
    // Fix time sort
    if (!sortAction.equals(timeSplit.sortAction)) {
        timeSplit = timeSplit.changeSortAction(sortAction);
        autoChanged = true;
    }
    // Fix time limit
    if (timeSplit.limitAction) {
        timeSplit = timeSplit.changeLimitAction(null);
        autoChanged = true;
    }
    let colorSplit = splits.get(0);
    if (!colorSplit.sortAction) {
        colorSplit = colorSplit.changeSortAction(dataCube.getDefaultSortAction());
        autoChanged = true;
    }
    var colorSplitDimension = dataCube.getDimensionByExpression(colorSplit.expression);
    if (!colors || colors.dimension !== colorSplitDimension.name) {
        colors = index_1.Colors.fromLimit(colorSplitDimension.name, 5);
        autoChanged = true;
    }
    if (!autoChanged)
        return manifest_1.Resolve.ready(10);
    return manifest_1.Resolve.automatic(8, {
        splits: new index_1.Splits(immutable_1.List([colorSplit, timeSplit])),
        colors: colors
    });
})
    .when(circumstances_handler_1.CircumstancesHandler.haveAtLeastSplitKinds('time'))
    .then((splits, dataCube) => {
    let timeSplit = splits.toArray().filter((split) => split.getDimension(dataCube.dimensions).kind === 'time')[0];
    return manifest_1.Resolve.manual(3, 'Too many splits', [
        {
            description: `Remove all but the time split`,
            adjustment: {
                splits: index_1.Splits.fromSplitCombine(timeSplit)
            }
        }
    ]);
})
    .otherwise((splits, dataCube) => {
    let continuousDimensions = dataCube.getDimensionByKind('time').concat(dataCube.getDimensionByKind('number'));
    return manifest_1.Resolve.manual(3, 'The Line Chart needs one continuous dimension split', continuousDimensions.toArray().map((continuousDimension) => {
        return {
            description: `Split on ${continuousDimension.title} instead`,
            adjustment: {
                splits: index_1.Splits.fromSplitCombine(index_1.SplitCombine.fromExpression(continuousDimension.expression))
            }
        };
    }));
});
exports.LINE_CHART_MANIFEST = new manifest_1.Manifest('line-chart', 'Line Chart', handler.evaluate.bind(handler));
