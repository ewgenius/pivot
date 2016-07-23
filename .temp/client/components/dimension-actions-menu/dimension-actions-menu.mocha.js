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
require('../../utils/test-utils/index');
const TestUtils = require('react-addons-test-utils');
const index_1 = require('../../utils/test-utils/index');
const dimension_actions_menu_1 = require('./dimension-actions-menu');
const mocks_1 = require('../../../common/models/mocks');
describe('DimensionActionsMenu', () => {
    it('adds the correct class', () => {
        var openOn = document.createElement('div');
        var renderedComponent = TestUtils.renderIntoDocument(React.createElement(dimension_actions_menu_1.DimensionActionsMenu, {clicker: null, containerStage: mocks_1.StageMock.defaultA(), dimension: mocks_1.DimensionMock.countryURL(), direction: 'right', essence: mocks_1.EssenceMock.wikiTotals(), onClose: null, openOn: openOn, triggerFilterMenu: null, triggerSplitMenu: null}));
        chai_1.expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
        chai_1.expect(index_1.findDOMNode(renderedComponent).className, 'should contain class').to.contain('dimension-actions-menu');
    });
});
