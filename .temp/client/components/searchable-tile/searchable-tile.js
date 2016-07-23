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
require('./searchable-tile.css');
const React = require('react');
const ReactDOM = require('react-dom');
const index_1 = require('../../../common/models/index');
const dom_1 = require('../../utils/dom/dom');
const tile_header_1 = require('../tile-header/tile-header');
const clearable_input_1 = require('../clearable-input/clearable-input');
const bubble_menu_1 = require('../bubble-menu/bubble-menu');
class SearchableTile extends React.Component {
    constructor() {
        super();
        this.state = {
            actionsMenuOpenOn: null
        };
        this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
        this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
    }
    componentDidMount() {
        this.mounted = true;
        this.setState({ actionsMenuAlignOn: ReactDOM.findDOMNode(this.refs['header']) });
        window.addEventListener('mousedown', this.globalMouseDownListener);
        window.addEventListener('keydown', this.globalKeyDownListener);
    }
    componentWillUnmount() {
        this.mounted = false;
        window.removeEventListener('mousedown', this.globalMouseDownListener);
        window.removeEventListener('keydown', this.globalKeyDownListener);
    }
    globalMouseDownListener(e) {
        var { searchText, toggleChangeFn } = this.props;
        // Remove search if it looses focus while empty
        if (searchText !== '')
            return;
        var target = e.target;
        var searchBoxElement = ReactDOM.findDOMNode(this.refs['search-box']);
        if (!searchBoxElement || dom_1.isInside(target, searchBoxElement))
            return;
        var headerRef = this.refs['header'];
        if (!headerRef)
            return;
        var searchButtonElement = ReactDOM.findDOMNode(headerRef.refs['search']);
        if (!searchButtonElement || dom_1.isInside(target, searchButtonElement))
            return;
        toggleChangeFn();
    }
    globalKeyDownListener(e) {
        const { toggleChangeFn, showSearch } = this.props;
        if (!dom_1.escapeKey(e))
            return;
        if (!showSearch)
            return;
        toggleChangeFn();
    }
    onActionsMenuClose() {
        var { actionsMenuOpenOn } = this.state;
        if (!actionsMenuOpenOn)
            return;
        this.setState({
            actionsMenuOpenOn: null
        });
    }
    onActionsMenuClick(e) {
        var { actionsMenuOpenOn } = this.state;
        if (actionsMenuOpenOn)
            return this.onActionsMenuClose();
        this.setState({
            actionsMenuOpenOn: e.target
        });
    }
    onSelectGranularity(action) {
        this.onActionsMenuClose();
        action.onSelect();
    }
    renderGranularityElements() {
        const { actions } = this.props;
        return actions.map((action) => {
            return React.createElement("li", {className: dom_1.classNames({ selected: action.selected }), key: action.keyString || action.toString(), onClick: this.onSelectGranularity.bind(this, action)}, action.displayValue || action.toString());
        });
    }
    renderActionsMenu() {
        const { actionsMenuOpenOn, actionsMenuAlignOn } = this.state;
        var stage = index_1.Stage.fromSize(180, 200);
        return React.createElement(bubble_menu_1.BubbleMenu, {align: "end", className: "dimension-tile-actions", direction: "down", stage: stage, onClose: this.onActionsMenuClose.bind(this), openOn: actionsMenuOpenOn, alignOn: actionsMenuAlignOn}, React.createElement("ul", {className: "bubble-list"}, this.renderGranularityElements()));
    }
    render() {
        const { className, style, icons, title, onSearchChange, showSearch, searchText, children, onDragStart, actions } = this.props;
        const { actionsMenuOpenOn } = this.state;
        var tileIcons = icons;
        if (actions && actions.length > 0) {
            tileIcons = [{
                    name: 'more',
                    ref: 'more',
                    onClick: this.onActionsMenuClick.bind(this),
                    svg: require('../../icons/full-more.svg'),
                    active: Boolean(actionsMenuOpenOn)
                }].concat(icons);
        }
        var qualifiedClassName = "searchable-tile " + className;
        const header = React.createElement(tile_header_1.TileHeader, {title: title, ref: "header", icons: tileIcons, onDragStart: onDragStart});
        var searchBar = null;
        if (showSearch) {
            searchBar = React.createElement("div", {className: "search-box", ref: "search-box"}, React.createElement(clearable_input_1.ClearableInput, {placeholder: "Search", focusOnMount: true, value: searchText, onChange: onSearchChange.bind(this)}));
        }
        qualifiedClassName = dom_1.classNames(qualifiedClassName, (showSearch ? 'has-search' : 'no-search'));
        return React.createElement("div", {className: qualifiedClassName, style: style}, header, searchBar, actionsMenuOpenOn ? this.renderActionsMenu() : null, children);
    }
}
exports.SearchableTile = SearchableTile;
