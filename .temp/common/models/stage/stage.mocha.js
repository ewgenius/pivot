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
const stage_1 = require('./stage');
const stage_mock_1 = require('./stage.mock');
describe('Stage', () => {
    it('is an immutable class', () => {
        tester_1.testImmutableClass(stage_1.Stage, [
            stage_mock_1.StageMock.DEFAULT_A_JS,
            stage_mock_1.StageMock.DEFAULT_B_JS,
            stage_mock_1.StageMock.DEFAULT_C_JS
        ]);
    });
});
