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
const chai_1 = require('chai');
require('../../utils/test-utils/index');
const plywood_1 = require('plywood');
const download_1 = require('./download');
describe.skip('Download', () => {
    describe('datasetToFileString', () => {
        it('defaults to JSON if no type specified', () => {
            var dsJS = [
                { x: 1, y: "hello", z: 2 },
                { x: 2, y: "world", z: 3 }
            ];
            var ds = plywood_1.Dataset.fromJS(dsJS);
            chai_1.expect(() => { JSON.parse(download_1.datasetToFileString(ds)); }).to.not.throw();
            chai_1.expect(JSON.parse(download_1.datasetToFileString(ds))).to.deep.equal(dsJS);
        });
        it('encloses set/string in brackets appropriately', () => {
            var ds = plywood_1.Dataset.fromJS([
                { y: ["dear", "john"] },
                { y: ["from", "peter"] }
            ]);
            chai_1.expect(download_1.datasetToFileString(ds, 'csv').indexOf("\"[dear,john\"]"), 'csv').to.not.equal(-1);
            chai_1.expect(download_1.datasetToFileString(ds, 'tsv').indexOf("[dear,john]"), 'tsv').to.not.equal(-1);
        });
    });
    describe('getMIMEType', () => {
        it('works as expected', () => {
            chai_1.expect(download_1.getMIMEType('csv'), 'csv').to.equal("text/csv");
            chai_1.expect(download_1.getMIMEType('tsv'), 'tsv').to.equal("text/tsv");
            chai_1.expect(download_1.getMIMEType(''), 'csv').to.equal('application/json');
            chai_1.expect(download_1.getMIMEType('json'), 'csv').to.equal('application/json');
            chai_1.expect(download_1.getMIMEType('invalid'), 'csv').to.equal('application/json');
        });
    });
});
