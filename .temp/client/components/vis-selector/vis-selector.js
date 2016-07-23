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
require('./vis-selector.css');
const React = require('react');
const dom_1 = require('../../utils/dom/dom');
const svg_icon_1 = require('../svg-icon/svg-icon');
const vis_selector_menu_1 = require('../vis-selector-menu/vis-selector-menu');
class VisSelector extends React.Component {
    constructor() {
        super();
        this.state = {
            menuOpenOn: null
        };
    }
    openMenu(e) {
        var { menuOpenOn } = this.state;
        var target = dom_1.findParentWithClass(e.target, 'vis-selector');
        if (menuOpenOn === target) {
            this.closeMenu();
            return;
        }
        this.setState({
            menuOpenOn: target
        });
    }
    closeMenu() {
        this.setState({
            menuOpenOn: null
        });
    }
    render() {
        var { clicker, essence } = this.props;
        var { menuOpenOn } = this.state;
        var { visualization } = essence;
        var menu = null;
        if (menuOpenOn) {
            menu = React.createElement(vis_selector_menu_1.VisSelectorMenu, {
                clicker: clicker,
                essence: essence,
                openOn: menuOpenOn,
                onClose: this.closeMenu.bind(this)
            });
        }
        return React.createElement("div", {className: dom_1.classNames('vis-selector', { active: menuOpenOn }), onClick: this.openMenu.bind(this)}, React.createElement("div", {className: "vis-item selected"}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/vis-' + visualization.name + '.svg')}), React.createElement("div", {className: "vis-title"}, visualization.title)), menu);
    }
}
exports.VisSelector = VisSelector;
