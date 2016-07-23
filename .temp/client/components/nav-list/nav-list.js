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
require('./nav-list.css');
const React = require('react');
const dom_1 = require('../../utils/dom/dom');
const svg_icon_1 = require('../svg-icon/svg-icon');
class NavList extends React.Component {
    renderIcon(iconSvg) {
        if (!iconSvg)
            return null;
        return React.createElement("span", {className: "icon"}, React.createElement(svg_icon_1.SvgIcon, {svg: iconSvg}));
    }
    renderNavList() {
        const { navLinks, iconSvg, selected } = this.props;
        return navLinks.map((navLink) => {
            return React.createElement(navLink.href ? 'a' : 'div', {
                className: dom_1.classNames('item', { selected: selected && selected === navLink.name }),
                key: navLink.name,
                title: navLink.tooltip,
                href: navLink.href,
                target: navLink.newTab ? '_blank' : null,
                onClick: navLink.onClick
            }, this.renderIcon(iconSvg), navLink.title);
        });
    }
    render() {
        const { title } = this.props;
        var className = "nav-list";
        var titleSection = null;
        if (title) {
            titleSection = React.createElement("div", {className: "group-title"}, title);
        }
        else {
            className += " no-title";
        }
        return React.createElement("div", {className: className}, titleSection, React.createElement("div", {className: "items"}, this.renderNavList()));
    }
    ;
}
exports.NavList = NavList;
