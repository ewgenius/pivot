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
const index_1 = require('../../utils/test-utils/index');
const TestUtils = require('react-addons-test-utils');
const mocks_1 = require('../../../common/models/mocks');
const chronoshift_1 = require('chronoshift');
var tzData = require('../../../../node_modules/chronoshift/lib/walltime/walltime-data.js');
chronoshift_1.WallTime.init(tzData.rules, tzData.zones);
const dimension_measure_panel_1 = require('../../components/dimension-measure-panel/dimension-measure-panel');
const filter_tile_1 = require('../../components/filter-tile/filter-tile');
const split_tile_1 = require('../../components/split-tile/split-tile');
const localStorage = require('../../utils/local-storage/local-storage');
describe('CubeView', () => {
    before(() => {
        index_1.mockReactComponent(dimension_measure_panel_1.DimensionMeasurePanel);
        index_1.mockReactComponent(filter_tile_1.FilterTile);
        index_1.mockReactComponent(split_tile_1.SplitTile);
    });
    after(() => {
        dimension_measure_panel_1.DimensionMeasurePanel.restore();
        filter_tile_1.FilterTile.restore();
        split_tile_1.SplitTile.restore();
    });
    var { CubeView } = index_1.mockRequireEnsure('./cube-view');
    it('adds the correct class', () => {
        var updateViewHash = sinon.stub();
        var renderedComponent = TestUtils.renderIntoDocument(React.createElement(CubeView, {hash: null, dataCube: mocks_1.DataCubeMock.wiki(), updateViewHash: updateViewHash}));
        chai_1.expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
        chai_1.expect(ReactDOM.findDOMNode(renderedComponent).className, 'should contain class').to.contain('cube-view');
    });
    it('remembers measure mode toggle click', () => {
        var updateViewHash = sinon.stub();
        var stub = sinon.stub(localStorage, "get");
        stub.withArgs('is-multi-measure').returns(undefined);
        var initialCubeView = TestUtils.renderIntoDocument(React.createElement(CubeView, {hash: null, dataCube: mocks_1.DataCubeMock.wiki(), updateViewHash: updateViewHash}));
        chai_1.expect(initialCubeView.state.essence.multiMeasureMode, 'default is single measure').to.equal(false);
        stub.restore();
        stub = sinon.stub(localStorage, "get");
        stub.withArgs('is-multi-measure').returns(true);
        var wikiCubeView = TestUtils.renderIntoDocument(React.createElement(CubeView, {hash: null, dataCube: mocks_1.DataCubeMock.wiki(), updateViewHash: updateViewHash}));
        chai_1.expect(wikiCubeView.state.essence.multiMeasureMode, 'multi measure in local storage is respected -> true').to.equal(true);
        stub.restore();
        stub = sinon.stub(localStorage, "get");
        stub.withArgs('is-multi-measure').returns(false);
        var wikiCubeView2 = TestUtils.renderIntoDocument(React.createElement(CubeView, {hash: null, dataCube: mocks_1.DataCubeMock.wiki(), updateViewHash: updateViewHash}));
        chai_1.expect(wikiCubeView2.state.essence.multiMeasureMode, 'multi measure in local storage is respected -> false').to.equal(false);
    });
});
