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
require('./dimension-list-tile.css');
const React = require('react');
const constants_1 = require('../../config/constants');
const drag_manager_1 = require('../../utils/drag-manager/drag-manager');
const dom_1 = require('../../utils/dom/dom');
const index_1 = require('../../../common/models/index');
const svg_icon_1 = require('../svg-icon/svg-icon');
const highlight_string_1 = require('../highlight-string/highlight-string');
const searchable_tile_1 = require('../searchable-tile/searchable-tile');
const DIMENSION_CLASS_NAME = 'dimension';
class DimensionListTile extends React.Component {
    constructor() {
        super();
        this.state = {
            DimensionActionsMenuAsync: null,
            menuOpenOn: null,
            menuDimension: null,
            highlightDimension: null,
            showSearch: false,
            searchText: ''
        };
    }
    componentDidMount() {
        require.ensure(['../dimension-actions-menu/dimension-actions-menu'], (require) => {
            this.setState({
                DimensionActionsMenuAsync: require('../dimension-actions-menu/dimension-actions-menu').DimensionActionsMenu
            });
        }, 'dimension-actions-menu');
    }
    clickDimension(dimension, e) {
        var { menuOpenOn } = this.state;
        var target = dom_1.findParentWithClass(e.target, DIMENSION_CLASS_NAME);
        if (menuOpenOn === target) {
            this.closeMenu();
            return;
        }
        this.setState({
            menuOpenOn: target,
            menuDimension: dimension
        });
    }
    closeMenu() {
        var { menuOpenOn } = this.state;
        if (!menuOpenOn)
            return;
        this.setState({
            menuOpenOn: null,
            menuDimension: null
        });
    }
    dragStart(dimension, e) {
        var { essence, getUrlPrefix } = this.props;
        var dataTransfer = e.dataTransfer;
        dataTransfer.effectAllowed = 'all';
        if (getUrlPrefix) {
            var newUrl = essence.changeSplit(index_1.SplitCombine.fromExpression(dimension.expression), index_1.VisStrategy.FairGame).getURL(getUrlPrefix());
            dataTransfer.setData("text/url-list", newUrl);
            dataTransfer.setData("text/plain", newUrl);
        }
        drag_manager_1.DragManager.setDragDimension(dimension, 'dimension-list-tile');
        dom_1.setDragGhost(dataTransfer, dimension.title);
        this.closeMenu();
    }
    onMouseOver(dimension) {
        var { highlightDimension } = this.state;
        if (highlightDimension === dimension)
            return;
        this.setState({
            highlightDimension: dimension
        });
    }
    onMouseLeave(dimension) {
        var { highlightDimension } = this.state;
        if (highlightDimension !== dimension)
            return;
        this.setState({
            highlightDimension: null
        });
    }
    toggleSearch() {
        var { showSearch } = this.state;
        this.setState({ showSearch: !showSearch });
        this.onSearchChange('');
    }
    onSearchChange(text) {
        var { searchText } = this.state;
        var newSearchText = text.substr(0, constants_1.MAX_SEARCH_LENGTH);
        if (searchText === newSearchText)
            return; // nothing to do;
        this.setState({
            searchText: newSearchText
        });
    }
    renderMenu() {
        var { essence, clicker, menuStage, triggerFilterMenu, triggerSplitMenu } = this.props;
        var { DimensionActionsMenuAsync, menuOpenOn, menuDimension } = this.state;
        if (!DimensionActionsMenuAsync || !menuDimension)
            return null;
        var onClose = this.closeMenu.bind(this);
        return React.createElement(DimensionActionsMenuAsync, {clicker: clicker, essence: essence, direction: "right", containerStage: menuStage, openOn: menuOpenOn, dimension: menuDimension, triggerFilterMenu: triggerFilterMenu, triggerSplitMenu: triggerSplitMenu, onClose: onClose});
    }
    render() {
        var { essence, style } = this.props;
        var { menuDimension, highlightDimension, showSearch, searchText } = this.state;
        var { dataCube } = essence;
        var shownDimensions = dataCube.dimensions.toArray();
        var itemY = 0;
        if (searchText) {
            shownDimensions = shownDimensions.filter((r) => {
                return r.title.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
            });
        }
        const dimensionItems = shownDimensions.map((dimension) => {
            var className = dom_1.classNames(DIMENSION_CLASS_NAME, 'type-' + dimension.className, {
                highlight: dimension === highlightDimension,
                selected: dimension === menuDimension
            });
            var style = dom_1.transformStyle(0, itemY);
            itemY += constants_1.DIMENSION_HEIGHT;
            return React.createElement("div", {className: className, key: dimension.name, onClick: this.clickDimension.bind(this, dimension), onMouseOver: this.onMouseOver.bind(this, dimension), onMouseLeave: this.onMouseLeave.bind(this, dimension), draggable: true, onDragStart: this.dragStart.bind(this, dimension), style: style}, React.createElement("div", {className: "icon"}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/dim-' + dimension.className + '.svg')})), React.createElement("div", {className: "item-title"}, React.createElement(highlight_string_1.HighlightString, {className: "label", text: dimension.title, highlightText: searchText})));
        }, this);
        var message = null;
        if (searchText && !dimensionItems.length) {
            message = React.createElement("div", {className: "message"}, `No ${constants_1.STRINGS.dimensions.toLowerCase()} for "${searchText}"`);
        }
        var icons = [
            //{ name: 'more', onClick: null, svg: require('../../icons/full-more-mini.svg') }
            {
                name: 'search',
                ref: 'search',
                onClick: this.toggleSearch.bind(this),
                svg: require('../../icons/full-search.svg'),
                active: showSearch
            }
        ];
        return React.createElement(searchable_tile_1.SearchableTile, {style: style, title: constants_1.STRINGS.dimensions, toggleChangeFn: this.toggleSearch.bind(this), onSearchChange: this.onSearchChange.bind(this), searchText: searchText, showSearch: showSearch, icons: icons, className: 'dimension-list-tile'}, React.createElement("div", {className: "items", ref: "items"}, dimensionItems, message), this.renderMenu());
    }
}
exports.DimensionListTile = DimensionListTile;
