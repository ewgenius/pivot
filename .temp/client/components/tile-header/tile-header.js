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
const dom_1 = require('../../utils/dom/dom');
require('./tile-header.css');
const React = require('react');
const svg_icon_1 = require('../svg-icon/svg-icon');
class TileHeader extends React.Component {
    constructor() {
        super();
    }
    renderIcons() {
        const { icons } = this.props;
        if (!icons || !icons.length)
            return null;
        var iconElements = icons.map(icon => {
            return React.createElement("div", {className: dom_1.classNames('icon', icon.name, { active: icon.active }), key: icon.name, onClick: icon.onClick, ref: icon.ref}, React.createElement(svg_icon_1.SvgIcon, {svg: icon.svg}));
        });
        return React.createElement("div", {className: "icons"}, iconElements);
    }
    render() {
        const { title, onDragStart } = this.props;
        return React.createElement("div", {className: "tile-header", draggable: onDragStart ? true : null, onDragStart: onDragStart}, React.createElement("div", {className: "title"}, title), this.renderIcons());
    }
}
exports.TileHeader = TileHeader;
