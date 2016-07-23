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
require('./dropdown.css');
const React = require('react');
const ReactDOM = require('react-dom');
const svg_icon_1 = require('../svg-icon/svg-icon');
const dom_1 = require('../../utils/dom/dom');
function simpleEqual(item1, item2) {
    return item1 === item2;
}
class Dropdown extends React.Component {
    constructor() {
        super();
        this.state = {
            open: false
        };
        this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
        this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
    }
    // Allows usage in TSX :
    // const MyDropdown = Dropdown.specialize<MyItemClass>();
    // then : <MyDropdown ... />
    static specialize() {
        return Dropdown;
    }
    componentDidMount() {
        window.addEventListener('mousedown', this.globalMouseDownListener);
        window.addEventListener('keydown', this.globalKeyDownListener);
    }
    componentWillUnmount() {
        window.removeEventListener('mousedown', this.globalMouseDownListener);
        window.removeEventListener('keydown', this.globalKeyDownListener);
    }
    onClick() {
        var { open } = this.state;
        this.setState({ open: !open });
    }
    globalMouseDownListener(e) {
        var { open } = this.state;
        if (!open)
            return;
        var myElement = ReactDOM.findDOMNode(this);
        if (!myElement)
            return;
        var target = e.target;
        if (dom_1.isInside(target, myElement))
            return;
        this.setState({ open: false });
    }
    globalKeyDownListener(e) {
        if (!dom_1.escapeKey(e))
            return;
        var { open } = this.state;
        if (!open)
            return;
        this.setState({ open: false });
    }
    renderMenu() {
        var { items, renderItem, keyItem, selectedItem, equal, onSelect, menuClassName } = this.props;
        if (!items || !items.length)
            return null;
        if (!renderItem)
            renderItem = String;
        if (!keyItem)
            keyItem = renderItem;
        if (!equal)
            equal = simpleEqual;
        var itemElements = items.map((item) => {
            return React.createElement("div", {className: dom_1.classNames('dropdown-item', equal(item, selectedItem) ? 'selected' : null), key: keyItem(item), onClick: () => onSelect(item)}, renderItem(item));
        });
        return React.createElement("div", {className: dom_1.classNames('dropdown-menu', menuClassName)}, itemElements);
    }
    render() {
        var { label, renderItem, selectedItem, direction, renderSelectedItem, className } = this.props;
        var { open } = this.state;
        if (!renderItem)
            renderItem = String;
        if (!direction)
            direction = 'down';
        if (!renderSelectedItem)
            renderSelectedItem = renderItem;
        var labelElement = null;
        if (label) {
            labelElement = React.createElement("div", {className: "dropdown-label"}, label);
        }
        return React.createElement("div", {className: dom_1.classNames('dropdown', direction, className), onClick: this.onClick.bind(this)}, labelElement, React.createElement("div", {className: dom_1.classNames('selected-item', { active: open })}, renderSelectedItem(selectedItem), React.createElement(svg_icon_1.SvgIcon, {className: "caret-icon", svg: require('../../icons/dropdown-caret.svg')})), open ? this.renderMenu() : null);
    }
}
exports.Dropdown = Dropdown;
