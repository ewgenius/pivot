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
const React = require('react');
const ReactDOM = require('react-dom');
const chronoshift_1 = require('chronoshift');
require('../../utils/test-utils/index');
const TestUtils = require('react-addons-test-utils');
const mocks_1 = require('../../../common/models/mocks');
const line_chart_axis_1 = require('./line-chart-axis');
describe('LineChartAxis', () => {
    it('adds the correct class', () => {
        var scale = {
            tickFormat: () => { }
        };
        var renderedComponent = TestUtils.renderIntoDocument(React.createElement(line_chart_axis_1.LineChartAxis, {scale: scale, stage: mocks_1.StageMock.defaultA(), ticks: [], timezone: chronoshift_1.Timezone.UTC}));
        chai_1.expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
        chai_1.expect(ReactDOM.findDOMNode(renderedComponent).className, 'should contain class').to.contain('line-chart-axis');
    });
});
