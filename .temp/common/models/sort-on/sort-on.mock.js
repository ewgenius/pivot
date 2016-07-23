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
const sort_on_1 = require('./sort-on');
class SortOnMock {
    static get DEFAULT_A_JS() {
        return {
            measure: {
                name: 'price',
                title: 'Price',
                formula: '$main.min($price)'
            }
        };
    }
    static get DEFAULT_B_JS() {
        return {
            measure: {
                name: 'price',
                title: 'Price',
                formula: '$main.sum($price)'
            }
        };
    }
    static get DEFAULT_C_JS() {
        return {
            dimension: {
                name: 'country',
                title: 'important countries',
                formula: '$country',
                kind: 'string'
            }
        };
    }
    static defaultA() {
        return sort_on_1.SortOn.fromJS(SortOnMock.DEFAULT_A_JS);
    }
    static defaultB() {
        return sort_on_1.SortOn.fromJS(SortOnMock.DEFAULT_B_JS);
    }
    static defaultC() {
        return sort_on_1.SortOn.fromJS(SortOnMock.DEFAULT_C_JS);
    }
}
exports.SortOnMock = SortOnMock;
