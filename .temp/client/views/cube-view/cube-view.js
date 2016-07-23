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
require('./cube-view.css');
const React = require('react');
const ReactDOM = require('react-dom');
const drag_manager_1 = require('../../utils/drag-manager/drag-manager');
const index_1 = require('../../../common/models/index');
const index_2 = require('../../../common/manifests/index');
const cube_header_bar_1 = require('../../components/cube-header-bar/cube-header-bar');
const dimension_measure_panel_1 = require('../../components/dimension-measure-panel/dimension-measure-panel');
const filter_tile_1 = require('../../components/filter-tile/filter-tile');
const split_tile_1 = require('../../components/split-tile/split-tile');
const vis_selector_1 = require('../../components/vis-selector/vis-selector');
const manual_fallback_1 = require('../../components/manual-fallback/manual-fallback');
const drop_indicator_1 = require('../../components/drop-indicator/drop-indicator');
const pinboard_panel_1 = require('../../components/pinboard-panel/pinboard-panel');
const resize_handle_1 = require('../../components/resize-handle/resize-handle');
const index_3 = require('../../visualizations/index');
const localStorage = require('../../utils/local-storage/local-storage');
const MIN_PANEL_WIDTH = 240;
const MAX_PANEL_WIDTH = 400;
class CubeView extends React.Component {
    constructor() {
        super();
        this.state = {
            essence: null,
            dragOver: false,
            showRawDataModal: false,
            layout: this.getStoredLayout(),
            updatingMaxTime: false
        };
        var clicker = {
            changeFilter: (filter, colors) => {
                var { essence } = this.state;
                essence = essence.changeFilter(filter);
                if (colors)
                    essence = essence.changeColors(colors);
                this.setState({ essence: essence });
            },
            changeTimeSelection: (selection) => {
                var { essence } = this.state;
                this.setState({ essence: essence.changeTimeSelection(selection) });
            },
            changeSplits: (splits, strategy, colors) => {
                var { essence } = this.state;
                if (colors)
                    essence = essence.changeColors(colors);
                this.setState({ essence: essence.changeSplits(splits, strategy) });
            },
            changeSplit: (split, strategy) => {
                var { essence } = this.state;
                this.setState({ essence: essence.changeSplit(split, strategy) });
            },
            addSplit: (split, strategy) => {
                var { essence } = this.state;
                this.setState({ essence: essence.addSplit(split, strategy) });
            },
            removeSplit: (split, strategy) => {
                var { essence } = this.state;
                this.setState({ essence: essence.removeSplit(split, strategy) });
            },
            changeColors: (colors) => {
                var { essence } = this.state;
                this.setState({ essence: essence.changeColors(colors) });
            },
            changeVisualization: (visualization) => {
                var { essence } = this.state;
                this.setState({ essence: essence.changeVisualization(visualization) });
            },
            pin: (dimension) => {
                var { essence } = this.state;
                this.setState({ essence: essence.pin(dimension) });
            },
            unpin: (dimension) => {
                var { essence } = this.state;
                this.setState({ essence: essence.unpin(dimension) });
            },
            changePinnedSortMeasure: (measure) => {
                var { essence } = this.state;
                this.setState({ essence: essence.changePinnedSortMeasure(measure) });
            },
            toggleMultiMeasureMode: () => {
                var { essence } = this.state;
                this.setState({ essence: essence.toggleMultiMeasureMode() });
            },
            toggleEffectiveMeasure: (measure) => {
                var { essence } = this.state;
                this.setState({ essence: essence.toggleEffectiveMeasure(measure) });
            },
            changeHighlight: (owner, measure, delta) => {
                var { essence } = this.state;
                this.setState({ essence: essence.changeHighlight(owner, measure, delta) });
            },
            acceptHighlight: () => {
                var { essence } = this.state;
                this.setState({ essence: essence.acceptHighlight() });
            },
            dropHighlight: () => {
                var { essence } = this.state;
                this.setState({ essence: essence.dropHighlight() });
            }
        };
        this.clicker = clicker;
        this.globalResizeListener = this.globalResizeListener.bind(this);
        this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
    }
    refreshMaxTime() {
        var { essence } = this.state;
        var { dataCube } = essence;
        this.setState({ updatingMaxTime: true });
        index_1.DataCube.updateMaxTime(dataCube)
            .then((updatedDataCube) => {
            if (!this.mounted)
                return;
            this.setState({ essence: essence.updateDataCube(updatedDataCube), updatingMaxTime: false });
        });
    }
    componentWillMount() {
        var { hash, dataCube, updateViewHash } = this.props;
        var essence = this.getEssenceFromHash(dataCube, hash);
        if (!essence) {
            if (!dataCube)
                throw new Error('must have data cube');
            essence = this.getEssenceFromDataCube(dataCube);
            updateViewHash(essence.toHash(), true);
        }
        this.setState({ essence: essence });
    }
    componentDidMount() {
        const { transitionFnSlot } = this.props;
        this.mounted = true;
        drag_manager_1.DragManager.init();
        window.addEventListener('resize', this.globalResizeListener);
        window.addEventListener('keydown', this.globalKeyDownListener);
        this.globalResizeListener();
        if (transitionFnSlot) {
            transitionFnSlot.fill((oldDataCube, newDataCube) => {
                if (newDataCube === oldDataCube || !newDataCube.sameGroup(oldDataCube))
                    return null;
                const { essence } = this.state;
                if (!essence)
                    return null;
                return '#' + newDataCube.name + '/' + essence.updateDataCube(newDataCube).toHash();
            });
        }
        require.ensure(['../../components/raw-data-modal/raw-data-modal'], (require) => {
            this.setState({
                RawDataModalAsync: require('../../components/raw-data-modal/raw-data-modal').RawDataModal
            });
        }, 'raw-data-modal');
    }
    componentWillReceiveProps(nextProps) {
        const { hash, dataCube, updateViewHash } = this.props;
        if (!nextProps.dataCube)
            throw new Error('must have data cube');
        if (dataCube.name !== nextProps.dataCube.name || hash !== nextProps.hash) {
            var hashEssence = this.getEssenceFromHash(nextProps.dataCube, nextProps.hash);
            if (!hashEssence) {
                hashEssence = this.getEssenceFromDataCube(nextProps.dataCube);
                updateViewHash(hashEssence.toHash(), true);
            }
            this.setState({ essence: hashEssence });
        }
    }
    componentWillUpdate(nextProps, nextState) {
        const { updateViewHash } = this.props;
        const { essence } = this.state;
        if (updateViewHash && !nextState.essence.equals(essence)) {
            updateViewHash(nextState.essence.toHash());
        }
    }
    componentWillUnmount() {
        const { transitionFnSlot } = this.props;
        this.mounted = false;
        window.removeEventListener('resize', this.globalResizeListener);
        window.removeEventListener('keydown', this.globalKeyDownListener);
        if (transitionFnSlot)
            transitionFnSlot.clear();
    }
    getEssenceFromDataCube(dataCube) {
        const essence = index_1.Essence.fromDataCube(dataCube, { dataCube: dataCube, visualizations: index_2.MANIFESTS });
        return essence.multiMeasureMode !== Boolean(localStorage.get('is-multi-measure')) ? essence.toggleMultiMeasureMode() : essence;
    }
    getEssenceFromHash(dataCube, hash) {
        if (!dataCube || !hash)
            return null;
        return index_1.Essence.fromHash(hash, { dataCube: dataCube, visualizations: index_2.MANIFESTS });
    }
    globalKeyDownListener(e) {
        // Shortcuts will go here one day
    }
    globalResizeListener() {
        var { container, visualization } = this.refs;
        var containerDOM = ReactDOM.findDOMNode(container);
        var visualizationDOM = ReactDOM.findDOMNode(visualization);
        if (!containerDOM || !visualizationDOM)
            return;
        let deviceSize = 'large';
        if (window.innerWidth <= 1250)
            deviceSize = 'medium';
        if (window.innerWidth <= 1080)
            deviceSize = 'small';
        this.setState({
            deviceSize: deviceSize,
            menuStage: index_1.Stage.fromClientRect(containerDOM.getBoundingClientRect()),
            visualizationStage: index_1.Stage.fromClientRect(visualizationDOM.getBoundingClientRect())
        });
    }
    canDrop(e) {
        return Boolean(drag_manager_1.DragManager.getDragDimension());
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
        this.setState({ dragOver: false });
    }
    drop(e) {
        if (!this.canDrop(e))
            return;
        e.preventDefault();
        var dimension = drag_manager_1.DragManager.getDragDimension();
        if (dimension) {
            this.clicker.changeSplit(index_1.SplitCombine.fromExpression(dimension.expression), index_1.VisStrategy.FairGame);
        }
        this.setState({ dragOver: false });
    }
    openRawDataModal() {
        this.setState({
            showRawDataModal: true
        });
    }
    onRawDataModalClose() {
        this.setState({
            showRawDataModal: false
        });
    }
    renderRawDataModal() {
        const { RawDataModalAsync, showRawDataModal, essence, visualizationStage } = this.state;
        if (!RawDataModalAsync || !showRawDataModal)
            return null;
        return React.createElement(RawDataModalAsync, {essence: essence, onClose: this.onRawDataModalClose.bind(this)});
    }
    triggerFilterMenu(dimension) {
        if (!dimension)
            return;
        this.refs['filterTile'].filterMenuRequest(dimension);
    }
    triggerSplitMenu(dimension) {
        if (!dimension)
            return;
        this.refs['splitTile'].splitMenuRequest(dimension);
    }
    changeTimezone(newTimezone) {
        const { essence } = this.state;
        const newEsssence = essence.changeTimezone(newTimezone);
        this.setState({ essence: newEsssence });
    }
    getStoredLayout() {
        return localStorage.get('cube-view-layout') || { dimensionPanelWidth: 240, pinboardWidth: 240 };
    }
    storeLayout(layout) {
        localStorage.set('cube-view-layout', layout);
    }
    onDimensionPanelResize(value) {
        let { layout } = this.state;
        layout.dimensionPanelWidth = value;
        this.setState({ layout: layout });
        this.storeLayout(layout);
    }
    onPinboardPanelResize(value) {
        let { layout } = this.state;
        layout.pinboardWidth = value;
        this.setState({ layout: layout });
        this.storeLayout(layout);
    }
    onPanelResizeEnd() {
        this.globalResizeListener();
    }
    render() {
        var clicker = this.clicker;
        var { getUrlPrefix, onNavClick, user, customization } = this.props;
        var { deviceSize, layout, essence, menuStage, visualizationStage, dragOver, updatingMaxTime } = this.state;
        if (!essence)
            return null;
        var { visualization } = essence;
        var visElement = null;
        if (essence.visResolve.isReady() && visualizationStage) {
            var visProps = {
                clicker: clicker,
                essence: essence,
                stage: visualizationStage,
                openRawDataModal: this.openRawDataModal.bind(this),
                registerDownloadableDataset: (dataset) => { this.downloadableDataset = dataset; }
            };
            visElement = React.createElement(index_3.getVisualizationComponent(visualization), visProps);
        }
        var manualFallback = null;
        if (essence.visResolve.isManual()) {
            manualFallback = React.createElement(manual_fallback_1.ManualFallback, {
                clicker: clicker,
                essence: essence
            });
        }
        var styles = {
            dimensionMeasurePanel: { width: layout.dimensionPanelWidth },
            centerPanel: { left: layout.dimensionPanelWidth, right: layout.pinboardWidth },
            pinboardPanel: { width: layout.pinboardWidth }
        };
        if (deviceSize === 'small') {
            styles = {
                dimensionMeasurePanel: { width: 200 },
                centerPanel: { left: 200, right: 200 },
                pinboardPanel: { width: 200 }
            };
        }
        return React.createElement("div", {className: 'cube-view'}, React.createElement(cube_header_bar_1.CubeHeaderBar, {clicker: clicker, essence: essence, user: user, onNavClick: onNavClick, getUrlPrefix: getUrlPrefix, refreshMaxTime: this.refreshMaxTime.bind(this), openRawDataModal: this.openRawDataModal.bind(this), customization: customization, getDownloadableDataset: () => this.downloadableDataset, changeTimezone: this.changeTimezone.bind(this), timezone: essence.timezone, updatingMaxTime: updatingMaxTime}), React.createElement("div", {className: "container", ref: 'container'}, React.createElement(dimension_measure_panel_1.DimensionMeasurePanel, {style: styles.dimensionMeasurePanel, clicker: clicker, essence: essence, menuStage: menuStage, triggerFilterMenu: this.triggerFilterMenu.bind(this), triggerSplitMenu: this.triggerSplitMenu.bind(this), getUrlPrefix: getUrlPrefix}), deviceSize !== 'small' ? React.createElement(resize_handle_1.ResizeHandle, {side: "left", initialValue: layout.dimensionPanelWidth, onResize: this.onDimensionPanelResize.bind(this), onResizeEnd: this.onPanelResizeEnd.bind(this), min: MIN_PANEL_WIDTH, max: MAX_PANEL_WIDTH}) : null, React.createElement("div", {className: 'center-panel', style: styles.centerPanel}, React.createElement("div", {className: 'center-top-bar'}, React.createElement("div", {className: 'filter-split-section'}, React.createElement(filter_tile_1.FilterTile, {ref: "filterTile", clicker: clicker, essence: essence, menuStage: visualizationStage, getUrlPrefix: getUrlPrefix}), React.createElement(split_tile_1.SplitTile, {ref: "splitTile", clicker: clicker, essence: essence, menuStage: visualizationStage, getUrlPrefix: getUrlPrefix})), React.createElement(vis_selector_1.VisSelector, {clicker: clicker, essence: essence})), React.createElement("div", {className: 'center-main', onDragEnter: this.dragEnter.bind(this)}, React.createElement("div", {className: 'visualization', ref: 'visualization'}, visElement), manualFallback, dragOver ? React.createElement(drop_indicator_1.DropIndicator, null) : null, dragOver ? React.createElement("div", {className: "drag-mask", onDragOver: this.dragOver.bind(this), onDragLeave: this.dragLeave.bind(this), onDragExit: this.dragLeave.bind(this), onDrop: this.drop.bind(this)}) : null)), deviceSize !== 'small' ? React.createElement(resize_handle_1.ResizeHandle, {side: "right", initialValue: layout.pinboardWidth, onResize: this.onPinboardPanelResize.bind(this), onResizeEnd: this.onPanelResizeEnd.bind(this), min: MIN_PANEL_WIDTH, max: MAX_PANEL_WIDTH}) : null, React.createElement(pinboard_panel_1.PinboardPanel, {style: styles.pinboardPanel, clicker: clicker, essence: essence, getUrlPrefix: getUrlPrefix})), this.renderRawDataModal());
    }
}
CubeView.defaultProps = {
    maxFilters: 20,
    maxSplits: 3
};
exports.CubeView = CubeView;
