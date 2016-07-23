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
require('./filter-tile.css');
const React = require('react');
const ReactDOM = require('react-dom');
const Q = require('q');
const constants_1 = require('../../config/constants');
const index_1 = require('../../../common/models/index');
const formatter_1 = require('../../../common/utils/formatter/formatter');
const pill_tile_1 = require('../../utils/pill-tile/pill-tile');
const dom_1 = require('../../utils/dom/dom');
const drag_manager_1 = require('../../utils/drag-manager/drag-manager');
const svg_icon_1 = require('../svg-icon/svg-icon');
const fancy_drag_indicator_1 = require('../fancy-drag-indicator/fancy-drag-indicator');
const bubble_menu_1 = require('../bubble-menu/bubble-menu');
const FILTER_CLASS_NAME = 'filter';
const ANIMATION_DURATION = 400;
function formatLabelDummy(dimension) {
    return dimension.title;
}
class FilterTile extends React.Component {
    constructor() {
        super();
        this.overflowMenuId = dom_1.uniqueId('overflow-menu-');
        this.state = {
            FilterMenuAsync: null,
            menuOpenOn: null,
            menuDimension: null,
            menuInside: null,
            overflowMenuOpenOn: null,
            dragPosition: null,
            possibleDimension: null,
            possiblePosition: null,
            maxItems: 20
        };
    }
    componentDidMount() {
        require.ensure(['../filter-menu/filter-menu'], (require) => {
            this.setState({
                FilterMenuAsync: require('../filter-menu/filter-menu').FilterMenu
            });
        }, 'filter-menu');
    }
    componentWillReceiveProps(nextProps) {
        const { menuStage } = nextProps;
        if (menuStage) {
            var newMaxItems = pill_tile_1.getMaxItems(menuStage.width, this.getItemBlanks().length);
            if (newMaxItems !== this.state.maxItems) {
                this.setState({
                    menuOpenOn: null,
                    menuDimension: null,
                    menuInside: null,
                    possibleDimension: null,
                    possiblePosition: null,
                    overflowMenuOpenOn: null,
                    maxItems: newMaxItems
                });
            }
        }
    }
    componentDidUpdate() {
        var { possibleDimension, overflowMenuOpenOn } = this.state;
        if (possibleDimension) {
            this.dummyDeferred.resolve(null);
        }
        if (overflowMenuOpenOn) {
            var overflowMenu = this.getOverflowMenu();
            if (overflowMenu)
                this.overflowMenuDeferred.resolve(overflowMenu);
        }
    }
    overflowButtonTarget() {
        return ReactDOM.findDOMNode(this.refs['overflow']);
    }
    getOverflowMenu() {
        return document.getElementById(this.overflowMenuId);
    }
    clickDimension(dimension, e) {
        var target = dom_1.findParentWithClass(e.target, FILTER_CLASS_NAME);
        this.openMenu(dimension, target);
    }
    openMenuOnDimension(dimension) {
        var targetRef = this.refs[dimension.name];
        if (targetRef) {
            var target = ReactDOM.findDOMNode(targetRef);
            if (!target)
                return;
            this.openMenu(dimension, target);
        }
        else {
            var overflowButtonTarget = this.overflowButtonTarget();
            if (overflowButtonTarget) {
                this.openOverflowMenu(overflowButtonTarget).then(() => {
                    var target = ReactDOM.findDOMNode(this.refs[dimension.name]);
                    if (!target)
                        return;
                    this.openMenu(dimension, target);
                });
            }
        }
    }
    openMenu(dimension, target) {
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
            menuInside: menuInside
        });
    }
    closeMenu() {
        var { menuOpenOn, possibleDimension } = this.state;
        if (!menuOpenOn)
            return;
        var newState = {
            menuOpenOn: null,
            menuDimension: null,
            menuInside: null,
            possibleDimension: null,
            possiblePosition: null
        };
        if (possibleDimension) {
            // If we are adding a ghost dimension also close the overflow menu
            // This is so it does not remain phantom open with nothing inside
            newState.overflowMenuOpenOn = null;
        }
        this.setState(newState);
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
    removeFilter(itemBlank, e) {
        var { essence, clicker } = this.props;
        if (itemBlank.clause) {
            if (itemBlank.source === 'from-highlight') {
                clicker.dropHighlight();
            }
            else {
                clicker.changeFilter(essence.filter.remove(itemBlank.clause.expression));
            }
        }
        this.closeMenu();
        this.closeOverflowMenu();
        e.stopPropagation();
    }
    dragStart(dimension, clause, e) {
        var { essence, getUrlPrefix } = this.props;
        var dataTransfer = e.dataTransfer;
        dataTransfer.effectAllowed = 'all';
        if (getUrlPrefix) {
            var newUrl = essence.getURL(getUrlPrefix());
            dataTransfer.setData("text/url-list", newUrl);
            dataTransfer.setData("text/plain", newUrl);
        }
        drag_manager_1.DragManager.setDragDimension(dimension, 'filter-tile');
        dom_1.setDragGhost(dataTransfer, dimension.title);
        this.closeMenu();
        this.closeOverflowMenu();
    }
    calculateDragPosition(e) {
        var { essence } = this.props;
        var numItems = essence.filter.length();
        var rect = ReactDOM.findDOMNode(this.refs['items']).getBoundingClientRect();
        var offset = dom_1.getXFromEvent(e) - rect.left;
        return index_1.DragPosition.calculateFromOffset(offset, numItems, constants_1.CORE_ITEM_WIDTH, constants_1.CORE_ITEM_GAP);
    }
    canDrop(e) {
        return Boolean(drag_manager_1.DragManager.getDragDimension());
    }
    dragEnter(e) {
        if (!this.canDrop(e))
            return;
        e.preventDefault();
        var dragPosition = this.calculateDragPosition(e);
        if (dragPosition.equals(this.state.dragPosition))
            return;
        this.setState({ dragPosition: dragPosition });
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
        this.setState({ dragPosition: null });
    }
    drop(e) {
        if (!this.canDrop(e))
            return;
        e.preventDefault();
        var { clicker, essence } = this.props;
        var { filter, dataCube } = essence;
        var newState = {
            dragPosition: null
        };
        var dimension = drag_manager_1.DragManager.getDragDimension();
        if (dimension) {
            var dragPosition = this.calculateDragPosition(e);
            var tryingToReplaceTime = false;
            if (dragPosition.replace !== null) {
                var targetClause = filter.clauses.get(dragPosition.replace);
                tryingToReplaceTime = targetClause && targetClause.expression.equals(dataCube.timeAttribute);
            }
            var existingClause = filter.clauseForExpression(dimension.expression);
            if (existingClause) {
                var newFilter;
                if (dragPosition.isReplace()) {
                    newFilter = filter.replaceByIndex(dragPosition.replace, existingClause);
                }
                else {
                    newFilter = filter.insertByIndex(dragPosition.insert, existingClause);
                }
                var newFilterSame = filter.equals(newFilter);
                if (!newFilterSame) {
                    clicker.changeFilter(newFilter);
                }
                if (drag_manager_1.DragManager.getDragOrigin() !== 'filter-tile') {
                    if (newFilterSame) {
                        this.filterMenuRequest(dimension);
                    }
                    else {
                        // Wait for the animation to finish to know where to open the menu
                        setTimeout(() => {
                            this.filterMenuRequest(dimension);
                        }, ANIMATION_DURATION + 50);
                    }
                }
            }
            else {
                if (dragPosition && !tryingToReplaceTime) {
                    this.addDummy(dimension, dragPosition);
                }
            }
        }
        this.setState(newState);
    }
    addDummy(dimension, possiblePosition) {
        this.dummyDeferred = Q.defer();
        this.setState({
            possibleDimension: dimension,
            possiblePosition: possiblePosition
        });
        this.dummyDeferred.promise.then(() => {
            this.openMenuOnDimension(dimension);
        });
    }
    // This will be called externally
    filterMenuRequest(dimension) {
        var { filter } = this.props.essence;
        if (filter.filteredOn(dimension.expression)) {
            this.openMenuOnDimension(dimension);
        }
        else {
            this.addDummy(dimension, new index_1.DragPosition({ insert: filter.length() }));
        }
    }
    overflowButtonClick() {
        this.openOverflowMenu(this.overflowButtonTarget());
    }
    ;
    renderMenu() {
        var { essence, clicker, menuStage } = this.props;
        var { FilterMenuAsync, menuOpenOn, menuDimension, menuInside, possiblePosition, maxItems, overflowMenuOpenOn } = this.state;
        if (!FilterMenuAsync || !menuDimension)
            return null;
        if (possiblePosition && possiblePosition.replace === maxItems) {
            possiblePosition = new index_1.DragPosition({ insert: possiblePosition.replace });
        }
        return React.createElement(FilterMenuAsync, {clicker: clicker, essence: essence, direction: "down", containerStage: overflowMenuOpenOn ? null : menuStage, openOn: menuOpenOn, dimension: menuDimension, changePosition: possiblePosition, onClose: this.closeMenu.bind(this), inside: menuInside});
    }
    renderOverflowMenu(overflowItemBlanks) {
        var { overflowMenuOpenOn } = this.state;
        if (!overflowMenuOpenOn)
            return null;
        var segmentHeight = 29 + constants_1.CORE_ITEM_GAP;
        var itemY = constants_1.CORE_ITEM_GAP;
        var filterItems = overflowItemBlanks.map((itemBlank) => {
            var style = dom_1.transformStyle(0, itemY);
            itemY += segmentHeight;
            return this.renderItemBlank(itemBlank, style);
        });
        return React.createElement(bubble_menu_1.BubbleMenu, {className: "overflow-menu", id: this.overflowMenuId, direction: "down", stage: index_1.Stage.fromSize(208, itemY), fixedSize: true, openOn: overflowMenuOpenOn, onClose: this.closeOverflowMenu.bind(this)}, filterItems);
    }
    renderOverflow(overflowItemBlanks, itemX) {
        var style = dom_1.transformStyle(itemX, 0);
        return React.createElement("div", {className: dom_1.classNames('overflow', { 'all-continuous': overflowItemBlanks.every(item => item.dimension.isContinuous()) }), ref: "overflow", key: "overflow", style: style, onClick: this.overflowButtonClick.bind(this)}, React.createElement("div", {className: "count"}, '+' + overflowItemBlanks.length), this.renderOverflowMenu(overflowItemBlanks));
    }
    renderRemoveButton(itemBlank) {
        var { essence } = this.props;
        var dataCube = essence.dataCube;
        if (itemBlank.dimension.expression.equals(dataCube.timeAttribute))
            return null;
        return React.createElement("div", {className: "remove", onClick: this.removeFilter.bind(this, itemBlank)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/x.svg')}));
    }
    renderItemLabel(dimension, clause, timezone) {
        var { title, values } = formatter_1.getFormattedClause(dimension, clause, timezone);
        return React.createElement("div", {className: "reading"}, title ? React.createElement("span", {className: "dimension-title"}, title) : null, React.createElement("span", {className: "values"}, values));
    }
    renderItemBlank(itemBlank, style) {
        var { essence, clicker } = this.props;
        var { menuDimension } = this.state;
        var { dimension, clause, source } = itemBlank;
        var dimensionName = dimension.name;
        var className = [
            FILTER_CLASS_NAME,
            'type-' + dimension.className,
            source,
            (clause && clause.exclude) ? 'excluded' : 'included',
            dimension === menuDimension ? 'selected' : undefined
        ].filter(Boolean).join(' ');
        var evaluatedClause = dimension.kind === 'time' && clause ? essence.evaluateClause(clause) : clause;
        var timezone = essence.timezone;
        if (source === 'from-highlight') {
            return React.createElement("div", {className: className, key: dimensionName, ref: dimensionName, onClick: clicker.acceptHighlight.bind(clicker), style: style}, this.renderItemLabel(dimension, evaluatedClause, timezone), this.renderRemoveButton(itemBlank));
        }
        if (clause) {
            return React.createElement("div", {className: className, key: dimensionName, ref: dimensionName, draggable: true, onClick: this.clickDimension.bind(this, dimension), onDragStart: this.dragStart.bind(this, dimension, clause), style: style}, this.renderItemLabel(dimension, evaluatedClause, timezone), this.renderRemoveButton(itemBlank));
        }
        else {
            return React.createElement("div", {className: className, key: dimensionName, ref: dimensionName, style: style}, React.createElement("div", {className: "reading"}, formatLabelDummy(dimension)), this.renderRemoveButton(itemBlank));
        }
    }
    getItemBlanks() {
        var { essence } = this.props;
        var { possibleDimension, possiblePosition, maxItems } = this.state;
        var { dataCube, filter, highlight } = essence;
        var itemBlanks = filter.clauses.toArray()
            .map((clause) => {
            var dimension = dataCube.getDimensionByExpression(clause.expression);
            if (!dimension)
                return null;
            return {
                dimension: dimension,
                source: 'from-filter',
                clause: clause
            };
        })
            .filter(Boolean);
        if (highlight) {
            highlight.delta.clauses.forEach((clause) => {
                var added = false;
                itemBlanks = itemBlanks.map((blank) => {
                    if (clause.expression.equals(blank.clause.expression)) {
                        added = true;
                        return {
                            dimension: blank.dimension,
                            source: 'from-highlight',
                            clause: clause
                        };
                    }
                    else {
                        return blank;
                    }
                });
                if (!added) {
                    var dimension = dataCube.getDimensionByExpression(clause.expression);
                    if (dimension) {
                        itemBlanks.push({
                            dimension: dimension,
                            source: 'from-highlight',
                            clause: clause
                        });
                    }
                }
            });
        }
        if (possibleDimension && possiblePosition) {
            var dummyBlank = {
                dimension: possibleDimension,
                source: 'from-drag'
            };
            if (possiblePosition.replace === maxItems) {
                possiblePosition = new index_1.DragPosition({ insert: possiblePosition.replace });
            }
            if (possiblePosition.isInsert()) {
                itemBlanks.splice(possiblePosition.insert, 0, dummyBlank);
            }
            else {
                itemBlanks[possiblePosition.replace] = dummyBlank;
            }
        }
        return itemBlanks;
    }
    render() {
        var { dragPosition, maxItems } = this.state;
        var itemBlanks = this.getItemBlanks();
        var itemX = 0;
        var filterItems = itemBlanks.slice(0, maxItems).map((item) => {
            var style = dom_1.transformStyle(itemX, 0);
            itemX += pill_tile_1.SECTION_WIDTH;
            return this.renderItemBlank(item, style);
        });
        var overflow = itemBlanks.slice(maxItems);
        if (overflow.length > 0) {
            var overFlowStart = filterItems.length * pill_tile_1.SECTION_WIDTH;
            filterItems.push(this.renderOverflow(overflow, overFlowStart));
        }
        return React.createElement("div", {className: 'filter-tile', onDragEnter: this.dragEnter.bind(this)}, React.createElement("div", {className: "title"}, constants_1.STRINGS.filter), React.createElement("div", {className: "items", ref: "items"}, filterItems), dragPosition ? React.createElement(fancy_drag_indicator_1.FancyDragIndicator, {dragPosition: dragPosition}) : null, dragPosition ? React.createElement("div", {className: "drag-mask", onDragOver: this.dragOver.bind(this), onDragLeave: this.dragLeave.bind(this), onDragExit: this.dragLeave.bind(this), onDrop: this.drop.bind(this)}) : null, this.renderMenu());
    }
}
exports.FilterTile = FilterTile;
