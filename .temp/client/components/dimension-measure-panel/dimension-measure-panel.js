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
require('./dimension-measure-panel.css');
const React = require('react');
const dom_1 = require('../../utils/dom/dom');
const dimension_list_tile_1 = require('../dimension-list-tile/dimension-list-tile');
const measures_tile_1 = require('../measures-tile/measures-tile');
const TOTAL_FLEXES = 100;
const MIN_FLEX = 20;
const MIN_HEIGHT = 150;
class DimensionMeasurePanel extends React.Component {
    constructor() {
        super();
    }
    render() {
        const { clicker, essence, menuStage, triggerFilterMenu, triggerSplitMenu, getUrlPrefix, style } = this.props;
        const { dataCube } = essence;
        // Compute relative sizes by diving up TOTAL_FLEXES
        var numDimensions = dataCube.dimensions.size;
        var numMeasures = dataCube.measures.size;
        var dimensionsFlex = dom_1.clamp(Math.ceil(TOTAL_FLEXES * numDimensions / (numDimensions + numMeasures)), MIN_FLEX, TOTAL_FLEXES - MIN_FLEX);
        var measuresFlex = TOTAL_FLEXES - dimensionsFlex;
        var dimensionListStyle = { flex: dimensionsFlex };
        if (dimensionsFlex === MIN_FLEX)
            dimensionListStyle.minHeight = MIN_HEIGHT;
        var measuresStyle = { flex: measuresFlex };
        if (measuresFlex === MIN_FLEX)
            measuresStyle.minHeight = MIN_HEIGHT;
        return React.createElement("div", {className: "dimension-measure-panel", style: style}, React.createElement(dimension_list_tile_1.DimensionListTile, {clicker: clicker, essence: essence, menuStage: menuStage, triggerFilterMenu: triggerFilterMenu, triggerSplitMenu: triggerSplitMenu, getUrlPrefix: getUrlPrefix, style: dimensionListStyle}), React.createElement(measures_tile_1.MeasuresTile, {clicker: clicker, essence: essence, style: measuresStyle}));
    }
}
exports.DimensionMeasurePanel = DimensionMeasurePanel;
