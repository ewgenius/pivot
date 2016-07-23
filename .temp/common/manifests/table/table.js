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
const circumstances_handler_1 = require('../../utils/circumstances-handler/circumstances-handler');
const manifest_1 = require('../../models/manifest/manifest');
var handler = circumstances_handler_1.CircumstancesHandler.EMPTY()
    .needsAtLeastOneSplit('The Table requires at least one split')
    .otherwise((splits, dataCube, colors, current) => {
    var autoChanged = false;
    splits = splits.map((split, i) => {
        if (!split.sortAction) {
            split = split.changeSortAction(dataCube.getDefaultSortAction());
            autoChanged = true;
        }
        var splitDimension = splits.get(0).getDimension(dataCube.dimensions);
        // ToDo: review this
        if (!split.limitAction && (autoChanged || splitDimension.kind !== 'time')) {
            split = split.changeLimit(i ? 5 : 50);
            autoChanged = true;
        }
        return split;
    });
    if (colors) {
        colors = null;
        autoChanged = true;
    }
    return autoChanged ? manifest_1.Resolve.automatic(6, { splits: splits }) : manifest_1.Resolve.ready(current ? 10 : 8);
});
exports.TABLE_MANIFEST = new manifest_1.Manifest('table', 'Table', handler.evaluate.bind(handler));
