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
const tester_1 = require('immutable-class/build/tester');
const splits_1 = require('./splits');
describe('Splits', () => {
    it('is an immutable class', () => {
        tester_1.testImmutableClass(splits_1.Splits, [
            [
                {
                    expression: { op: 'ref', name: 'language' }
                }
            ],
            [
                {
                    expression: { op: 'ref', name: 'time' }
                }
            ],
            [
                {
                    expression: { op: 'ref', name: 'time' },
                    bucketAction: {
                        action: 'in',
                        expression: {
                            'op': 'literal',
                            'value': { 'setType': 'STRING', 'elements': ['he'] },
                            'type': 'SET'
                        }
                    },
                    sortAction: {
                        action: 'sort',
                        direction: 'ascending',
                        expression: {
                            op: 'ref',
                            name: 'time'
                        }
                    },
                    limitAction: {
                        action: 'limit',
                        limit: 2
                    }
                },
                {
                    expression: { op: 'ref', name: 'time' }
                },
                {
                    expression: { op: 'ref', name: 'time' }
                }
            ]
        ]);
    });
});
