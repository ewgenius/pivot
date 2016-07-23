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
require('./item-card.css');
const React = require('react');
const constants_1 = require('../../../config/constants');
const svg_icon_1 = require('../../../components/svg-icon/svg-icon');
class ItemCard extends React.Component {
    render() {
        const { title, description, icon, onClick } = this.props;
        return React.createElement("div", {className: "item-card", onClick: onClick}, React.createElement("div", {className: "inner-container"}, React.createElement(svg_icon_1.SvgIcon, {svg: require(`../../../icons/${icon}.svg`)}), React.createElement("div", {className: "text"}, React.createElement("div", {className: "title"}, title), React.createElement("div", {className: "description"}, description || constants_1.STRINGS.noDescription))));
    }
}
exports.ItemCard = ItemCard;
