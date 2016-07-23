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
require('./pinboard-panel.css');
const React = require('react');
const plywood_1 = require('plywood');
const constants_1 = require('../../config/constants');
const svg_icon_1 = require('../svg-icon/svg-icon');
const index_1 = require('../../../common/models/index');
const drag_manager_1 = require('../../utils/drag-manager/drag-manager');
const pinboard_measure_tile_1 = require('../pinboard-measure-tile/pinboard-measure-tile');
const dimension_tile_1 = require('../dimension-tile/dimension-tile');
class PinboardPanel extends React.Component {
    constructor() {
        super();
        this.state = {
            dragOver: false
        };
    }
    canDrop(e) {
        var dimension = drag_manager_1.DragManager.getDragDimension();
        if (dimension) {
            var pinnedDimensions = this.props.essence.pinnedDimensions;
            return !pinnedDimensions.has(dimension.name);
        }
        return false;
    }
    dragEnter(e) {
        if (!this.canDrop(e))
            return;
        e.preventDefault();
        this.setState({ dragOver: true });
    }
    dragOver(e) {
        if (!this.canDrop(e))
            return;
        e.dataTransfer.dropEffect = 'move';
        e.preventDefault();
    }
    dragLeave(e) {
        if (!this.canDrop(e))
            return;
        this.setState({ dragOver: false });
    }
    drop(e) {
        if (!this.canDrop(e))
            return;
        e.preventDefault();
        var dimension = drag_manager_1.DragManager.getDragDimension();
        if (dimension) {
            this.props.clicker.pin(dimension);
        }
        this.setState({ dragOver: false });
    }
    getColorsSortOn() {
        var { essence } = this.props;
        var { dataCube, splits, colors } = essence;
        if (colors) {
            var dimension = dataCube.getDimension(colors.dimension);
            if (dimension) {
                var split = splits.findSplitForDimension(dimension);
                if (split) {
                    return index_1.SortOn.fromSortAction(split.sortAction, dataCube, dimension);
                }
            }
        }
        return null;
    }
    onLegendSortOnSelect(sortOn) {
        var { clicker, essence } = this.props;
        var { dataCube, splits, colors } = essence;
        if (colors) {
            var dimension = dataCube.getDimension(colors.dimension);
            if (dimension) {
                var split = splits.findSplitForDimension(dimension);
                if (split) {
                    var sortAction = split.sortAction;
                    var direction = sortAction ? sortAction.direction : plywood_1.SortAction.DESCENDING;
                    var newSplit = split.changeSortAction(new plywood_1.SortAction({
                        expression: sortOn.getExpression(),
                        direction: direction
                    }));
                    var newColors = index_1.Colors.fromLimit(colors.dimension, 5);
                    clicker.changeSplits(splits.replace(split, newSplit), index_1.VisStrategy.UnfairGame, newColors);
                }
            }
        }
    }
    onPinboardSortOnSelect(sortOn) {
        if (!sortOn.measure)
            return;
        var { clicker } = this.props;
        clicker.changePinnedSortMeasure(sortOn.measure);
    }
    onRemoveLegend() {
        var { clicker, essence } = this.props;
        var { dataCube, splits, colors } = essence;
        if (colors) {
            var dimension = dataCube.getDimension(colors.dimension);
            if (dimension) {
                var split = splits.findSplitForDimension(dimension);
                if (split) {
                    clicker.changeSplits(splits.removeSplit(split), index_1.VisStrategy.UnfairGame, null);
                }
            }
        }
    }
    render() {
        var { clicker, essence, getUrlPrefix, style } = this.props;
        var { dragOver } = this.state;
        var { dataCube, pinnedDimensions, colors } = essence;
        var legendMeasureSelector = null;
        var legendDimensionTile = null;
        var colorDimension = colors ? colors.dimension : null;
        if (colorDimension) {
            var dimension = dataCube.getDimension(colorDimension);
            if (dimension) {
                var colorsSortOn = this.getColorsSortOn();
                legendMeasureSelector = React.createElement(pinboard_measure_tile_1.PinboardMeasureTile, {essence: essence, title: "Legend", dimension: dimension, sortOn: colorsSortOn, onSelect: this.onLegendSortOnSelect.bind(this)});
                legendDimensionTile = React.createElement(dimension_tile_1.DimensionTile, {clicker: clicker, essence: essence, dimension: dimension, sortOn: colorsSortOn, colors: colors, onClose: this.onRemoveLegend.bind(this), getUrlPrefix: getUrlPrefix});
            }
        }
        var pinnedSortSortOn = index_1.SortOn.fromMeasure(essence.getPinnedSortMeasure());
        var dimensionTiles = [];
        pinnedDimensions.forEach((dimensionName) => {
            var dimension = dataCube.getDimension(dimensionName);
            if (!dimension)
                return null;
            dimensionTiles.push(React.createElement(dimension_tile_1.DimensionTile, {key: dimension.name, clicker: clicker, essence: essence, dimension: dimension, sortOn: pinnedSortSortOn, onClose: clicker.unpin ? clicker.unpin.bind(clicker, dimension) : null, getUrlPrefix: getUrlPrefix}));
        });
        var placeholder = null;
        if (!dragOver && !dimensionTiles.length) {
            placeholder = React.createElement("div", {className: "placeholder"}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/preview-pin.svg')}), React.createElement("div", {className: "placeholder-message"}, constants_1.STRINGS.pinboardPlaceholder));
        }
        return React.createElement("div", {className: "pinboard-panel", onDragEnter: this.dragEnter.bind(this), style: style}, legendMeasureSelector, legendDimensionTile, React.createElement(pinboard_measure_tile_1.PinboardMeasureTile, {essence: essence, title: constants_1.STRINGS.pinboard, sortOn: pinnedSortSortOn, onSelect: this.onPinboardSortOnSelect.bind(this)}), dimensionTiles, dragOver ? React.createElement("div", {className: "drop-indicator-tile"}) : null, placeholder, dragOver ? React.createElement("div", {className: "drag-mask", onDragOver: this.dragOver.bind(this), onDragLeave: this.dragLeave.bind(this), onDragExit: this.dragLeave.bind(this), onDrop: this.drop.bind(this)}) : null);
    }
}
exports.PinboardPanel = PinboardPanel;
