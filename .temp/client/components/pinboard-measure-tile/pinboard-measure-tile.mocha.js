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
const index_1 = require('../../../common/models/index');
const mocks_1 = require('../../../common/models/mocks');
const pinboard_measure_tile_1 = require('./pinboard-measure-tile');
describe('PinboardMeasureTile', () => {
    it('adds the correct class', () => {
        var essence = mocks_1.EssenceMock.wikiTotals();
        var sortOn = new index_1.SortOn({ dimension: essence.dataCube.getDimension('articleName') });
        var renderedComponent = TestUtils.renderIntoDocument(React.createElement(pinboard_measure_tile_1.PinboardMeasureTile, {essence: essence, title: "Pinboard", sortOn: sortOn, onSelect: null}));
        chai_1.expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
        chai_1.expect(ReactDOM.findDOMNode(renderedComponent).className, 'should contain class').to.contain('pinboard-measure-tile');
    });
});
