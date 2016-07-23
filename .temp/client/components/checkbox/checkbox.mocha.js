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
const sinon = require('sinon');
const React = require('react');
const ReactDOM = require('react-dom');
require('../../utils/test-utils/index');
const TestUtils = require('react-addons-test-utils');
const checkbox_1 = require('./checkbox');
describe('Checkbox', () => {
    it('adds the correct class', () => {
        var renderedComponent = TestUtils.renderIntoDocument(React.createElement(checkbox_1.Checkbox, {selected: true}));
        chai_1.expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
        chai_1.expect(ReactDOM.findDOMNode(renderedComponent).className, 'should contain class').to.contain('checkbox');
    });
    it('not checked + check', () => {
        var onClick = sinon.spy();
        var renderedComponent = TestUtils.renderIntoDocument(React.createElement(checkbox_1.Checkbox, {selected: false, onClick: onClick}));
        var svgs = TestUtils.scryRenderedDOMComponentsWithTag(renderedComponent, 'svg');
        chai_1.expect(svgs.length).to.equal(0);
        chai_1.expect(onClick.callCount).to.equal(0);
        TestUtils.Simulate.click(ReactDOM.findDOMNode(renderedComponent));
        chai_1.expect(onClick.callCount).to.equal(1);
    });
});
