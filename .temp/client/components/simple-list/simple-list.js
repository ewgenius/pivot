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
require('./simple-list.css');
const React = require('react');
const svg_icon_1 = require('../svg-icon/svg-icon');
class SimpleList extends React.Component {
    constructor() {
        super();
    }
    renderRows(rows) {
        if (!rows || !rows.length)
            return [];
        const { onEdit, onRemove } = this.props;
        const svgize = (iconName) => iconName ? React.createElement(svg_icon_1.SvgIcon, {svg: require(`../../icons/${iconName}.svg`)}) : null;
        return rows.map(({ title, description, icon }, i) => {
            let svg = svgize(icon);
            let text = React.createElement("div", {className: "text"}, React.createElement("div", {className: "title"}, title), React.createElement("div", {className: "description"}, description));
            let actions = React.createElement("div", {className: "actions"}, React.createElement("button", {onClick: onEdit.bind(this, i)}, svgize('full-edit')), React.createElement("button", {onClick: onRemove.bind(this, i)}, svgize('full-remove')));
            return React.createElement("div", {className: "row", key: `row-${i}`}, svg, text, actions);
        });
    }
    render() {
        const rows = this.renderRows(this.props.rows);
        return React.createElement("div", {className: "simple-list"}, rows);
    }
}
exports.SimpleList = SimpleList;
