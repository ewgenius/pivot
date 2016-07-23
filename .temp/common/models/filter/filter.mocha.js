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
const plywood_1 = require('plywood');
const filter_1 = require('./filter');
describe('Filter', () => {
    it('is an immutable class', () => {
        tester_1.testImmutableClass(filter_1.Filter, [
            { op: 'literal', value: true },
            {
                "op": "chain", "expression": { "op": "ref", "name": "language" },
                "action": {
                    "action": "overlap",
                    "expression": {
                        "op": "literal",
                        "value": { "setType": "STRING", "elements": ["en"] },
                        "type": "SET"
                    }
                }
            },
            {
                "op": "chain", "expression": { "op": "ref", "name": "time" },
                "action": {
                    "action": "in",
                    "expression": {
                        "op": "literal",
                        "value": { "start": new Date("2013-02-26T19:00:00.000Z"), "end": new Date("2013-02-26T22:00:00.000Z") },
                        "type": "TIME_RANGE"
                    }
                }
            },
            {
                "op": "chain", "expression": { "op": "ref", "name": "language" },
                "action": {
                    "action": "overlap",
                    "expression": {
                        "op": "literal",
                        "value": { "setType": "STRING", "elements": ["he"] },
                        "type": "SET"
                    }
                }
            },
            {
                "op": "chain",
                "expression": { "op": "ref", "name": "language" },
                "actions": [
                    {
                        "action": "overlap",
                        "expression": {
                            "op": "literal",
                            "value": { "setType": "STRING", "elements": ["he"] },
                            "type": "SET"
                        }
                    },
                    {
                        "action": "and",
                        "expression": {
                            "op": "chain", "expression": { "op": "ref", "name": "namespace" },
                            "action": {
                                "action": "overlap",
                                "expression": {
                                    "op": "literal",
                                    "value": { "setType": "STRING", "elements": ["wikipedia"] },
                                    "type": "SET"
                                }
                            }
                        }
                    }
                ]
            },
            // Dynamic
            {
                "op": "chain", "expression": { "op": "ref", "name": "time" },
                "action": {
                    "action": "in",
                    "expression": {
                        op: 'chain',
                        expression: { op: 'ref', name: 'n' },
                        action: { action: 'timeRange', duration: 'P1D', step: -1 }
                    }
                }
            }
        ]);
    });
    it('works in empty case', () => {
        var filter = filter_1.Filter.EMPTY;
        chai_1.expect(filter.toExpression().toJS()).to.deep.equal({
            "op": "literal",
            "value": true
        });
    });
    it('add works', () => {
        var filter = filter_1.Filter.EMPTY;
        var $language = plywood_1.$('language');
        filter = filter.addValue($language, 'en');
        var ex = $language.overlap(['en']);
        chai_1.expect(filter.toExpression().toJS()).to.deep.equal(ex.toJS());
        filter = filter.addValue($language, null);
        var ex = $language.overlap(['en', null]);
        chai_1.expect(filter.toExpression().toJS()).to.deep.equal(ex.toJS());
    });
    it('upgrades', () => {
        var filter = filter_1.Filter.fromJS({
            "op": "chain",
            "expression": { "op": "ref", "name": "language" },
            "actions": [
                {
                    "action": "in",
                    "expression": {
                        "op": "literal",
                        "value": { "setType": "STRING", "elements": ["he"] },
                        "type": "SET"
                    }
                },
                {
                    "action": "and",
                    "expression": {
                        "op": "chain", "expression": { "op": "ref", "name": "namespace" },
                        "action": {
                            "action": "in",
                            "expression": {
                                "op": "literal",
                                "value": { "setType": "STRING", "elements": ["wikipedia"] },
                                "type": "SET"
                            }
                        }
                    }
                }
            ]
        });
        chai_1.expect(filter.toJS()).to.deep.equal({
            "op": "chain",
            "expression": { "op": "ref", "name": "language" },
            "actions": [
                {
                    "action": "overlap",
                    "expression": {
                        "op": "literal",
                        "value": { "setType": "STRING", "elements": ["he"] },
                        "type": "SET"
                    }
                },
                {
                    "action": "and",
                    "expression": {
                        "op": "chain", "expression": { "op": "ref", "name": "namespace" },
                        "action": {
                            "action": "overlap",
                            "expression": {
                                "op": "literal",
                                "value": { "setType": "STRING", "elements": ["wikipedia"] },
                                "type": "SET"
                            }
                        }
                    }
                }
            ]
        });
    });
});
