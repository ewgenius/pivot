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
require('./button.css');
const React = require('react');
const dom_1 = require('../../utils/dom/dom');
const svg_icon_1 = require('../svg-icon/svg-icon');
class Button extends React.Component {
    constructor() {
        super();
    }
    render() {
        const { title, type, className, svg, active, disabled, onClick } = this.props;
        var icon = null;
        if (svg) {
            icon = React.createElement(svg_icon_1.SvgIcon, {svg: svg});
        }
        return React.createElement("button", {className: dom_1.classNames('button', type, className, { icon: icon, active: active }), onClick: onClick, disabled: disabled}, icon, title);
    }
}
exports.Button = Button;
