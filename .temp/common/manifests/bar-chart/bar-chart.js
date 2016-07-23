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
const index_1 = require('../../models/index');
const manifest_1 = require('../../models/manifest/manifest');
const circumstances_handler_1 = require('../../utils/circumstances-handler/circumstances-handler');
var handler = circumstances_handler_1.CircumstancesHandler.EMPTY()
    .needsAtLeastOneSplit('The Bar Chart requires at least one split')
    .when(circumstances_handler_1.CircumstancesHandler.areExactSplitKinds('*'))
    .or(circumstances_handler_1.CircumstancesHandler.areExactSplitKinds('*', '*'))
    .then((splits, dataCube, colors, current) => {
    var continuousBoost = 0;
    // Auto adjustment
    var autoChanged = false;
    splits = splits.map((split) => {
        var splitDimension = dataCube.getDimensionByExpression(split.expression);
        if (!split.sortAction) {
            // Must sort boolean in deciding order!
            if (splitDimension.kind === 'boolean') {
                split = split.changeSortAction(new plywood_1.SortAction({
                    expression: plywood_1.$(splitDimension.name),
                    direction: plywood_1.SortAction.DESCENDING
                }));
            }
            else {
                if (splitDimension.isContinuous()) {
                    split = split.changeSortAction(new plywood_1.SortAction({
                        expression: plywood_1.$(splitDimension.name),
                        direction: plywood_1.SortAction.ASCENDING
                    }));
                }
                else {
                    split = split.changeSortAction(dataCube.getDefaultSortAction());
                }
            }
            autoChanged = true;
        }
        else if (splitDimension.isContinuous() && split.sortAction.refName() !== splitDimension.name) {
            split = split.changeSortAction(new plywood_1.SortAction({
                expression: plywood_1.$(splitDimension.name),
                direction: split.sortAction.direction
            }));
            autoChanged = true;
        }
        if (splitDimension.kind === 'number') {
            continuousBoost = 4;
        }
        // ToDo: review this
        if (!split.limitAction && (autoChanged || splitDimension.kind !== 'time')) {
            split = split.changeLimit(25);
            autoChanged = true;
        }
        if (colors) {
            colors = null;
            autoChanged = true;
        }
        return split;
    });
    if (autoChanged) {
        return manifest_1.Resolve.automatic(5 + continuousBoost, { splits: splits });
    }
    return manifest_1.Resolve.ready(current ? 10 : (7 + continuousBoost));
})
    .otherwise((splits, dataCube) => {
    let categoricalDimensions = dataCube.dimensions.filter((d) => d.kind !== 'time');
    return manifest_1.Resolve.manual(3, 'The Bar Chart needs one or two splits', categoricalDimensions.toArray().slice(0, 2).map((dimension) => {
        return {
            description: `Split on ${dimension.title} instead`,
            adjustment: {
                splits: index_1.Splits.fromSplitCombine(index_1.SplitCombine.fromExpression(dimension.expression))
            }
        };
    }));
});
exports.BAR_CHART_MANIFEST = new manifest_1.Manifest('bar-chart', 'Bar Chart', handler.evaluate.bind(handler));
