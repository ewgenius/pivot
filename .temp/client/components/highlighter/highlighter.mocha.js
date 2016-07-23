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
require('../../utils/test-utils/index');
const TestUtils = require('react-addons-test-utils');
const plywood_1 = require('plywood');
const highlighter_1 = require('./highlighter');
describe('Highlighter', () => {
    it('adds the correct class', () => {
        var fakeTimeRange = plywood_1.TimeRange.fromJS({
            start: new Date('2015-01-26T04:54:10Z'),
            end: new Date('2015-01-26T05:54:10Z')
        });
        var myScaleX = (value) => { return 42; };
        var renderedComponent = TestUtils.renderIntoDocument(React.createElement(highlighter_1.Highlighter, {highlightRange: fakeTimeRange, scaleX: myScaleX}));
        chai_1.expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
        chai_1.expect(ReactDOM.findDOMNode(renderedComponent).className, 'should contain class').to.contain('highlighter');
    });
});
