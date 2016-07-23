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
const refresh_rule_1 = require('./refresh-rule');
describe('RefreshRule', () => {
    it('is an immutable class', () => {
        tester_1.testImmutableClass(refresh_rule_1.RefreshRule, [
            {
                rule: 'fixed',
                time: new Date("2015-10-15T19:21:00Z")
            },
            {
                rule: 'query',
                refresh: 'P1D'
            },
            {
                rule: 'query',
                refresh: 'PT1M'
            },
            {
                rule: 'realtime',
                refresh: 'PT1M'
            }
        ]);
    });
    describe('Auto refresh rate', () => {
        it("works for query", () => {
            chai_1.expect(refresh_rule_1.RefreshRule.fromJS({ rule: 'query' }).toJS()).to.deep.equal({
                rule: 'query',
                refresh: 'PT1M'
            });
        });
        it("works for realtime", () => {
            chai_1.expect(refresh_rule_1.RefreshRule.fromJS({ rule: 'realtime' }).toJS()).to.deep.equal({
                rule: 'realtime',
                refresh: 'PT1M'
            });
        });
    });
});
