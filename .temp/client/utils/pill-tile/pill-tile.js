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
const constants_1 = require('../../config/constants');
exports.SECTION_WIDTH = constants_1.CORE_ITEM_WIDTH + constants_1.CORE_ITEM_GAP;
function getWidthNoOverflowAdjustment(stageWidth) {
    return stageWidth - constants_1.BAR_TITLE_WIDTH - constants_1.VIS_SELECTOR_WIDTH + constants_1.CORE_ITEM_GAP;
}
function getMaxItems(stageWidth, itemsLength) {
    var maxWidth = getWidthNoOverflowAdjustment(stageWidth);
    var includedItems = itemsLength;
    var initialMax = Math.floor((maxWidth - constants_1.OVERFLOW_WIDTH) / exports.SECTION_WIDTH);
    if (initialMax < includedItems) {
        var widthPlusOverflow = initialMax * exports.SECTION_WIDTH + constants_1.OVERFLOW_WIDTH + constants_1.CORE_ITEM_GAP;
        var maxItems = null;
        if (maxWidth < widthPlusOverflow) {
            maxItems = initialMax - 1;
        }
        else if (includedItems - initialMax === 1) {
            maxItems = Math.floor(maxWidth / exports.SECTION_WIDTH);
        }
        else {
            maxItems = initialMax;
        }
        return maxItems;
    }
    else {
        return initialMax;
    }
}
exports.getMaxItems = getMaxItems;
