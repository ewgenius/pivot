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
require('./split-tile.css');
const React = require('react');
const ReactDOM = require('react-dom');
const Q = require('q');
const svg_icon_1 = require('../svg-icon/svg-icon');
const constants_1 = require('../../config/constants');
const index_1 = require('../../../common/models/index');
const dom_1 = require('../../utils/dom/dom');
const pill_tile_1 = require('../../utils/pill-tile/pill-tile');
const drag_manager_1 = require('../../utils/drag-manager/drag-manager');
const fancy_drag_indicator_1 = require('../fancy-drag-indicator/fancy-drag-indicator');
const bubble_menu_1 = require('../bubble-menu/bubble-menu');
const SPLIT_CLASS_NAME = 'split';
class SplitTile extends React.Component {
    constructor() {
        super();
        this.overflowMenuId = dom_1.uniqueId('overflow-menu-');
        this.state = {
            SplitMenuAsync: null,
            menuOpenOn: null,
            menuDimension: null,
            dragPosition: null,
            maxItems: null
        };
    }
    componentDidMount() {
        require.ensure(['../split-menu/split-menu'], (require) => {
            this.setState({
                SplitMenuAsync: require('../split-menu/split-menu').SplitMenu
            });
        }, 'split-menu');
    }
    componentWillReceiveProps(nextProps) {
        const { menuStage, essence } = nextProps;
        var { splits } = essence;
        if (menuStage) {
            var newMaxItems = pill_tile_1.getMaxItems(menuStage.width, splits.toArray().length);
            if (newMaxItems !== this.state.maxItems) {
                this.setState({
                    menuOpenOn: null,
                    menuDimension: null,
                    overflowMenuOpenOn: null,
                    maxItems: newMaxItems
                });
            }
        }
    }
    componentDidUpdate() {
        var { overflowMenuOpenOn } = this.state;
        if (overflowMenuOpenOn) {
            var overflowMenu = this.getOverflowMenu();
            if (overflowMenu)
                this.overflowMenuDeferred.resolve(overflowMenu);
        }
    }
    selectDimensionSplit(dimension, split, e) {
        var target = dom_1.findParentWithClass(e.target, SPLIT_CLASS_NAME);
        this.openMenu(dimension, split, target);
    }
    openMenu(dimension, split, target) {
        var { menuOpenOn } = this.state;
        if (menuOpenOn === target) {
            this.closeMenu();
            return;
        }
        var overflowMenu = this.getOverflowMenu();
        var menuInside = null;
        if (overflowMenu && dom_1.isInside(target, overflowMenu)) {
            menuInside = overflowMenu;
        }
        this.setState({
            menuOpenOn: target,
            menuDimension: dimension,
            menuSplit: split,
            menuInside: menuInside
        });
    }
    closeMenu() {
        var { menuOpenOn } = this.state;
        if (!menuOpenOn)
            return;
        this.setState({
            menuOpenOn: null,
            menuDimension: null,
            menuInside: null,
            menuSplit: null
        });
    }
    getOverflowMenu() {
        return document.getElementById(this.overflowMenuId);
    }
    openOverflowMenu(target) {
        if (!target)
            return;
        var { overflowMenuOpenOn } = this.state;
        if (overflowMenuOpenOn === target) {
            this.closeOverflowMenu();
            return;
        }
        this.overflowMenuDeferred = Q.defer();
        this.setState({ overflowMenuOpenOn: target });
        return this.overflowMenuDeferred.promise;
    }
    closeOverflowMenu() {
        var { overflowMenuOpenOn } = this.state;
        if (!overflowMenuOpenOn)
            return;
        this.setState({
            overflowMenuOpenOn: null
        });
    }
    removeSplit(split, e) {
        var { clicker } = this.props;
        clicker.removeSplit(split, index_1.VisStrategy.FairGame);
        this.closeMenu();
        this.closeOverflowMenu();
        e.stopPropagation();
    }
    dragStart(dimension, split, splitIndex, e) {
        var { essence, getUrlPrefix } = this.props;
        var dataTransfer = e.dataTransfer;
        dataTransfer.effectAllowed = 'all';
        if (getUrlPrefix) {
            var newUrl = essence.changeSplit(index_1.SplitCombine.fromExpression(dimension.expression), index_1.VisStrategy.FairGame).getURL(getUrlPrefix());
            dataTransfer.setData("text/url-list", newUrl);
            dataTransfer.setData("text/plain", newUrl);
        }
        drag_manager_1.DragManager.setDragSplit(split, 'filter-tile');
        drag_manager_1.DragManager.setDragDimension(dimension, 'filter-tile');
        dom_1.setDragGhost(dataTransfer, dimension.title);
        this.closeMenu();
        this.closeOverflowMenu();
    }
    calculateDragPosition(e) {
        const { essence } = this.props;
        var numItems = essence.splits.length();
        var rect = ReactDOM.findDOMNode(this.refs['items']).getBoundingClientRect();
        var x = dom_1.getXFromEvent(e);
        var offset = x - rect.left;
        return index_1.DragPosition.calculateFromOffset(offset, numItems, constants_1.CORE_ITEM_WIDTH, constants_1.CORE_ITEM_GAP);
    }
    canDrop(e) {
        return Boolean(drag_manager_1.DragManager.getDragSplit() || drag_manager_1.DragManager.getDragDimension());
    }
    dragEnter(e) {
        if (!this.canDrop(e))
            return;
        e.preventDefault();
        this.setState({
            dragPosition: this.calculateDragPosition(e)
        });
    }
    dragOver(e) {
        if (!this.canDrop(e))
            return;
        e.dataTransfer.dropEffect = 'move';
        e.preventDefault();
        var dragPosition = this.calculateDragPosition(e);
        if (dragPosition.equals(this.state.dragPosition))
            return;
        this.setState({ dragPosition: dragPosition });
    }
    dragLeave(e) {
        if (!this.canDrop(e))
            return;
        this.setState({
            dragPosition: null
        });
    }
    drop(e) {
        if (!this.canDrop(e))
            return;
        e.preventDefault();
        var { clicker, essence } = this.props;
        var { maxItems } = this.state;
        var { splits } = essence;
        var newSplitCombine = null;
        if (drag_manager_1.DragManager.getDragSplit()) {
            newSplitCombine = drag_manager_1.DragManager.getDragSplit();
        }
        else if (drag_manager_1.DragManager.getDragDimension()) {
            newSplitCombine = index_1.SplitCombine.fromExpression(drag_manager_1.DragManager.getDragDimension().expression);
        }
        if (newSplitCombine) {
            var dragPosition = this.calculateDragPosition(e);
            if (dragPosition.replace === maxItems) {
                dragPosition = new index_1.DragPosition({ insert: dragPosition.replace });
            }
            if (dragPosition.isReplace()) {
                clicker.changeSplits(splits.replaceByIndex(dragPosition.replace, newSplitCombine), index_1.VisStrategy.FairGame);
            }
            else {
                clicker.changeSplits(splits.insertByIndex(dragPosition.insert, newSplitCombine), index_1.VisStrategy.FairGame);
            }
        }
        this.setState({
            dragPosition: null
        });
    }
    // This will be called externally
    splitMenuRequest(dimension) {
        var { splits } = this.props.essence;
        var split = splits.findSplitForDimension(dimension);
        if (!split)
            return;
        var targetRef = this.refs[dimension.name];
        if (!targetRef)
            return;
        var target = ReactDOM.findDOMNode(targetRef);
        if (!target)
            return;
        this.openMenu(dimension, split, target);
    }
    overflowButtonTarget() {
        return ReactDOM.findDOMNode(this.refs['overflow']);
    }
    overflowButtonClick() {
        this.openOverflowMenu(this.overflowButtonTarget());
    }
    ;
    renderMenu() {
        var { essence, clicker, menuStage } = this.props;
        var { SplitMenuAsync, menuOpenOn, menuDimension, menuSplit, menuInside, overflowMenuOpenOn } = this.state;
        if (!SplitMenuAsync || !menuDimension)
            return null;
        var onClose = this.closeMenu.bind(this);
        return React.createElement(SplitMenuAsync, {clicker: clicker, essence: essence, containerStage: overflowMenuOpenOn ? null : menuStage, openOn: menuOpenOn, dimension: menuDimension, split: menuSplit, onClose: onClose, inside: menuInside});
    }
    renderOverflowMenu(items) {
        var { overflowMenuOpenOn } = this.state;
        if (!overflowMenuOpenOn)
            return null;
        var segmentHeight = 29 + constants_1.CORE_ITEM_GAP;
        var itemY = constants_1.CORE_ITEM_GAP;
        var filterItems = items.map((item, i) => {
            var style = dom_1.transformStyle(0, itemY);
            itemY += segmentHeight;
            return this.renderSplit(item, style, i);
        });
        return React.createElement(bubble_menu_1.BubbleMenu, {className: "overflow-menu", id: this.overflowMenuId, direction: "down", stage: index_1.Stage.fromSize(208, itemY), fixedSize: true, openOn: overflowMenuOpenOn, onClose: this.closeOverflowMenu.bind(this)}, filterItems);
    }
    renderOverflow(items, itemX) {
        var { essence } = this.props;
        var { dataCube } = essence;
        var style = dom_1.transformStyle(itemX, 0);
        return React.createElement("div", {className: dom_1.classNames('overflow', { 'all-continuous': items.every(item => item.getDimension(dataCube.dimensions).isContinuous()) }), ref: "overflow", key: "overflow", style: style, onClick: this.overflowButtonClick.bind(this)}, React.createElement("div", {className: "count"}, '+' + items.length), this.renderOverflowMenu(items));
    }
    renderSplit(split, style, i) {
        var { essence } = this.props;
        var { menuDimension } = this.state;
        var { dataCube } = essence;
        var dimension = split.getDimension(dataCube.dimensions);
        if (!dimension)
            throw new Error('dimension not found');
        var dimensionName = dimension.name;
        var classNames = [
            SPLIT_CLASS_NAME,
            'type-' + dimension.className
        ];
        if (dimension === menuDimension)
            classNames.push('selected');
        return React.createElement("div", {className: classNames.join(' '), key: split.toKey(), ref: dimensionName, draggable: true, onClick: this.selectDimensionSplit.bind(this, dimension, split), onDragStart: this.dragStart.bind(this, dimension, split, i), style: style}, React.createElement("div", {className: "reading"}, split.getTitle(dataCube.dimensions)), React.createElement("div", {className: "remove", onClick: this.removeSplit.bind(this, split)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/x.svg')})));
    }
    render() {
        var { essence } = this.props;
        var { dragPosition, maxItems } = this.state;
        var { splits } = essence;
        var splitsArray = splits.toArray();
        var itemX = 0;
        var splitItems = splitsArray.slice(0, maxItems).map((split, i) => {
            var style = dom_1.transformStyle(itemX, 0);
            itemX += pill_tile_1.SECTION_WIDTH;
            return this.renderSplit(split, style, i);
        }, this);
        var overflowItems = splitsArray.slice(maxItems);
        if (overflowItems.length > 0) {
            var overFlowStart = splitItems.length * pill_tile_1.SECTION_WIDTH;
            splitItems.push(this.renderOverflow(overflowItems, overFlowStart));
        }
        return React.createElement("div", {className: "split-tile", onDragEnter: this.dragEnter.bind(this)}, React.createElement("div", {className: "title"}, constants_1.STRINGS.split), React.createElement("div", {className: "items", ref: "items"}, splitItems), dragPosition ? React.createElement(fancy_drag_indicator_1.FancyDragIndicator, {dragPosition: dragPosition}) : null, dragPosition ? React.createElement("div", {className: "drag-mask", onDragOver: this.dragOver.bind(this), onDragLeave: this.dragLeave.bind(this), onDragExit: this.dragLeave.bind(this), onDrop: this.drop.bind(this)}) : null, this.renderMenu());
    }
}
exports.SplitTile = SplitTile;
