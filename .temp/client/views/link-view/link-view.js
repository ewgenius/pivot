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
require('./link-view.css');
const React = require('react');
const ReactDOM = require('react-dom');
const plywood_1 = require('plywood');
const dom_1 = require('../../utils/dom/dom');
const index_1 = require('../../../common/models/index');
const localStorage = require('../../utils/local-storage/local-storage');
const link_header_bar_1 = require('../../components/link-header-bar/link-header-bar');
const manual_fallback_1 = require('../../components/manual-fallback/manual-fallback');
const pinboard_panel_1 = require('../../components/pinboard-panel/pinboard-panel');
const button_group_1 = require('../../components/button-group/button-group');
const resize_handle_1 = require('../../components/resize-handle/resize-handle');
const index_2 = require('../../visualizations/index');
var $maxTime = plywood_1.$(index_1.FilterClause.MAX_TIME_REF_NAME);
var latestPresets = [
    { name: '5M', selection: $maxTime.timeRange('PT5M', -1) },
    { name: '1H', selection: $maxTime.timeRange('PT1H', -1) },
    { name: '1D', selection: $maxTime.timeRange('P1D', -1) },
    { name: '1W', selection: $maxTime.timeRange('P1W', -1) }
];
const MIN_PANEL_WIDTH = 240;
const MAX_PANEL_WIDTH = 400;
class LinkView extends React.Component {
    constructor() {
        super();
        this.state = {
            linkItem: null,
            essence: null,
            visualizationStage: null,
            menuStage: null,
            layout: this.getStoredLayout()
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
            changeColors: (colors) => {
                var { essence } = this.state;
                this.setState({ essence: essence.changeColors(colors) });
            },
            changePinnedSortMeasure: (measure) => {
                var { essence } = this.state;
                this.setState({ essence: essence.changePinnedSortMeasure(measure) });
            },
            toggleMeasure: (measure) => {
                var { essence } = this.state;
                this.setState({ essence: essence.toggleSelectedMeasure(measure) });
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
    }
    componentWillMount() {
        var { hash, linkViewConfig, updateViewHash } = this.props;
        var linkItem = linkViewConfig.findByName(hash);
        if (!linkItem) {
            linkItem = linkViewConfig.defaultLinkItem();
            updateViewHash(linkItem.name);
        }
        this.setState({
            linkItem: linkItem,
            essence: linkItem.essence
        });
    }
    componentDidMount() {
        window.addEventListener('resize', this.globalResizeListener);
        this.globalResizeListener();
    }
    componentWillReceiveProps(nextProps) {
        const { hash, linkViewConfig } = this.props;
        if (hash !== nextProps.hash) {
            var linkItem = linkViewConfig.findByName(hash);
            this.setState({ linkItem: linkItem });
        }
    }
    componentWillUpdate(nextProps, nextState) {
        const { updateViewHash } = this.props;
        const { linkItem } = this.state;
        if (updateViewHash && !nextState.linkItem.equals(linkItem)) {
            updateViewHash(nextState.linkItem.name);
        }
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.globalResizeListener);
    }
    globalResizeListener() {
        var { container, visualization } = this.refs;
        var containerDOM = ReactDOM.findDOMNode(container);
        var visualizationDOM = ReactDOM.findDOMNode(visualization);
        if (!containerDOM || !visualizationDOM)
            return;
        this.setState({
            menuStage: index_1.Stage.fromClientRect(containerDOM.getBoundingClientRect()),
            visualizationStage: index_1.Stage.fromClientRect(visualizationDOM.getBoundingClientRect())
        });
    }
    selectLinkItem(linkItem) {
        const { essence } = this.state;
        var newEssence = linkItem.essence;
        if (essence.getTimeAttribute()) {
            newEssence = newEssence.changeTimeSelection(essence.getTimeSelection());
        }
        this.setState({
            linkItem: linkItem,
            essence: newEssence
        });
    }
    goToCubeView() {
        var { changeHash, getUrlPrefix } = this.props;
        var { essence } = this.state;
        changeHash(`${essence.dataCube.name}/${essence.toHash()}`, true);
    }
    getStoredLayout() {
        return localStorage.get('link-view-layout') || { linkPanelWidth: 240, pinboardWidth: 240 };
    }
    storeLayout(layout) {
        localStorage.set('link-view-layout', layout);
    }
    onLinkPanelResize(value) {
        let { layout } = this.state;
        layout.linkPanelWidth = value;
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
    renderPresets() {
        const { essence } = this.state;
        var presetToButton = (preset) => {
            return {
                isSelected: preset.selection.equals(essence.getTimeSelection()),
                title: preset.name,
                onClick: this.clicker.changeTimeSelection.bind(this, preset.selection),
                key: preset.name
            };
        };
        return React.createElement(button_group_1.ButtonGroup, {groupMembers: latestPresets.map(presetToButton)});
    }
    renderLinkPanel(style) {
        const { linkViewConfig } = this.props;
        const { linkItem } = this.state;
        var groupId = 0;
        var lastGroup = null;
        var items = [];
        linkViewConfig.linkItems.forEach(li => {
            // Add a group header if needed
            if (lastGroup !== li.group) {
                items.push(React.createElement("div", {className: "link-group-title", key: 'group_' + groupId}, li.group));
                groupId++;
                lastGroup = li.group;
            }
            items.push(React.createElement("div", {className: dom_1.classNames('link-item', { selected: li === linkItem }), key: 'li_' + li.name, onClick: this.selectLinkItem.bind(this, li)}, li.title));
        });
        return React.createElement("div", {className: "link-panel", style: style}, React.createElement("div", {className: "link-container"}, items));
    }
    render() {
        var clicker = this.clicker;
        var { getUrlPrefix, onNavClick, linkViewConfig, user, customization } = this.props;
        var { linkItem, essence, visualizationStage, layout } = this.state;
        if (!linkItem)
            return null;
        var { visualization } = essence;
        var visElement = null;
        if (essence.visResolve.isReady() && visualizationStage) {
            var visProps = {
                clicker: clicker,
                essence: essence,
                stage: visualizationStage
            };
            visElement = React.createElement(index_2.getVisualizationComponent(visualization), visProps);
        }
        var manualFallback = null;
        if (essence.visResolve.isManual()) {
            manualFallback = React.createElement(manual_fallback_1.ManualFallback, {
                clicker: clicker,
                essence: essence
            });
        }
        var styles = {
            linkMeasurePanel: { width: layout.linkPanelWidth },
            centerPanel: { left: layout.linkPanelWidth, right: layout.pinboardWidth },
            pinboardPanel: { width: layout.pinboardWidth }
        };
        return React.createElement("div", {className: 'link-view'}, React.createElement(link_header_bar_1.LinkHeaderBar, {title: linkViewConfig.title, user: user, onNavClick: onNavClick, onExploreClick: this.goToCubeView.bind(this), getUrlPrefix: getUrlPrefix, customization: customization}), React.createElement("div", {className: "container", ref: 'container'}, this.renderLinkPanel(styles.linkMeasurePanel), React.createElement(resize_handle_1.ResizeHandle, {side: "left", initialValue: layout.linkPanelWidth, onResize: this.onLinkPanelResize.bind(this), onResizeEnd: this.onPanelResizeEnd.bind(this), min: MIN_PANEL_WIDTH, max: MAX_PANEL_WIDTH}), React.createElement("div", {className: 'center-panel', style: styles.centerPanel}, React.createElement("div", {className: 'center-top-bar'}, React.createElement("div", {className: 'link-title'}, linkItem.title), React.createElement("div", {className: 'link-description'}, linkItem.description), React.createElement("div", {className: "right-align"}, this.renderPresets())), React.createElement("div", {className: 'center-main'}, React.createElement("div", {className: 'visualization', ref: 'visualization'}, visElement), manualFallback)), React.createElement(resize_handle_1.ResizeHandle, {side: "right", initialValue: layout.pinboardWidth, onResize: this.onPinboardPanelResize.bind(this), onResizeEnd: this.onPanelResizeEnd.bind(this), min: MIN_PANEL_WIDTH, max: MAX_PANEL_WIDTH}), React.createElement(pinboard_panel_1.PinboardPanel, {style: styles.pinboardPanel, clicker: clicker, essence: essence, getUrlPrefix: getUrlPrefix})));
    }
}
exports.LinkView = LinkView;
