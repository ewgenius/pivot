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
require('./checkbox.css');
const React = require('react');
const svg_icon_1 = require('../svg-icon/svg-icon');
const dom_1 = require('../../utils/dom/dom');
class Checkbox extends React.Component {
    constructor() {
        super();
    }
    renderIcon() {
        const { selected, type } = this.props;
        if (!selected)
            return null;
        if (type === 'check') {
            return React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/check.svg')});
        }
        else if (type === 'cross') {
            return React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/x.svg')});
        }
        return null;
    }
    render() {
        const { onClick, type, color, selected } = this.props;
        var style = null;
        if (color) {
            style = { background: color };
        }
        return React.createElement("div", {className: dom_1.classNames('checkbox', type, { selected: selected, color: color }), onClick: onClick}, React.createElement("div", {className: "checkbox-body", style: style}), this.renderIcon());
    }
}
Checkbox.defaultProps = {
    type: 'check'
};
exports.Checkbox = Checkbox;
