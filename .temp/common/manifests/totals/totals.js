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
const index_1 = require('../../models/index');
const manifest_1 = require('../../models/manifest/manifest');
function handleCircumstance(dataCube, splits, colors, current) {
    if (!splits.length())
        return manifest_1.Resolve.ready(10);
    return manifest_1.Resolve.automatic(3, { splits: index_1.Splits.EMPTY });
}
exports.TOTALS_MANIFEST = new manifest_1.Manifest('totals', 'Totals', handleCircumstance, 'multi');
