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
const tester_1 = require('immutable-class/build/tester');
const colors_1 = require('./colors');
describe('Colors', () => {
    it('is an immutable class', () => {
        tester_1.testImmutableClass(colors_1.Colors, [
            {
                dimension: 'country',
                limit: 5
            },
            {
                dimension: 'country',
                values: { '1': 'USA', '3': 'UK', '7': 'India' }
            },
            {
                dimension: 'country',
                values: { '3': 'UK', '7': 'India' },
                hasNull: true
            },
            {
                dimension: 'country',
                values: { '3': 100, '7': 200 },
                hasNull: true
            },
            {
                dimension: 'country',
                values: { '1': 'USA', '3': 'UK', '8': 'India' }
            },
            {
                dimension: 'country',
                values: { '0': 'USA', '1': 'UK', '2': 'India' }
            },
            {
                dimension: 'country',
                values: { '0': 'USA', '1': 'UK', '3': 'India' }
            }
        ]);
    });
    describe('methods', () => {
        describe('#fromLimit', () => {
            it('works in basic case', () => {
                var colors = colors_1.Colors.fromLimit('country', 5);
                chai_1.expect(colors.toJS()).to.deep.equal({
                    dimension: 'country',
                    limit: 5
                });
            });
        });
        describe('#fromValues', () => {
            it('works in basic case', () => {
                var colors = colors_1.Colors.fromValues('country', [null, 'Madagascar', 'UK', 'India', 'Russia']);
                chai_1.expect(colors.toJS()).to.deep.equal({
                    "dimension": "country",
                    "values": {
                        "0": 'Madagascar',
                        "1": "UK",
                        "2": "India",
                        "3": "Russia"
                    },
                    "hasNull": true
                });
                chai_1.expect(colors.has(null), 'has null').to.equal(true);
                chai_1.expect(colors.has('South Africa'), 'no SA').to.equal(false);
                colors = colors.add('South Africa');
                chai_1.expect(colors.has('South Africa')).to.equal(true);
                chai_1.expect(colors.toJS()).to.deep.equal({
                    "dimension": "country",
                    "values": {
                        "0": "Madagascar",
                        "1": "UK",
                        "2": "India",
                        "3": "Russia",
                        "4": "South Africa"
                    },
                    "hasNull": true
                });
                colors = colors.remove('UK');
                chai_1.expect(colors.toJS()).to.deep.equal({
                    "dimension": "country",
                    "values": {
                        "0": "Madagascar",
                        "2": "India",
                        "3": "Russia",
                        "4": "South Africa"
                    },
                    "hasNull": true
                });
                colors = colors.add('Australia');
                chai_1.expect(colors.toJS()).to.deep.equal({
                    "dimension": "country",
                    "values": {
                        "0": "Madagascar",
                        "1": "Australia",
                        "2": "India",
                        "3": "Russia",
                        "4": "South Africa"
                    },
                    "hasNull": true
                });
                var colorsWithGap = colors.remove("Australia");
                chai_1.expect(colors.equals(colorsWithGap)).to.equal(false);
                chai_1.expect(colorsWithGap.equals(colors)).to.equal(false);
            });
        });
    });
    describe('#getColors', () => {
        it('works in basic case (with null)', () => {
            var colors = colors_1.Colors.fromValues('country', [null, 'UK', 'India', 'Russia', 'Madagascar']);
            chai_1.expect(colors.getColors(['UK', null, 'lol'])).to.deep.equal(['#2D95CA', '#666666', null]);
        });
        it('works in basic case (no null)', () => {
            var colors = colors_1.Colors.fromValues('country', ['Null Island', 'UK', 'India', 'Russia', 'Madagascar']);
            chai_1.expect(colors.getColors(['UK', null, 'lol'])).to.deep.equal(['#EFB925', null, null]);
        });
    });
});
