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
const TestUtils = require('react-addons-test-utils');
const index_1 = require('../../utils/test-utils/index');
const bubble_menu_1 = require('./bubble-menu');
const mocks_1 = require('../../../common/models/mocks');
describe('BubbleMenu', () => {
    it('adds the correct class', () => {
        var openOn = document.createElement('div');
        var renderedComponent = TestUtils.renderIntoDocument(React.createElement(bubble_menu_1.BubbleMenu, {children: null, className: null, containerStage: null, direction: 'right', onClose: null, openOn: openOn, stage: mocks_1.StageMock.defaultA()}));
        chai_1.expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
        chai_1.expect(index_1.findDOMNode(renderedComponent).className, 'should contain class').to.contain('bubble-menu');
    });
});
