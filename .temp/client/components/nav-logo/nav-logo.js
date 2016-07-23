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
require('./nav-logo.css');
const React = require('react');
const svg_icon_1 = require('../svg-icon/svg-icon');
class NavLogo extends React.Component {
    constructor() {
        super();
    }
    render() {
        const { onClick, customLogoSvg } = this.props;
        const svg = customLogoSvg || require('../../icons/pivot-logo.svg');
        return React.createElement("div", {className: "nav-logo", onClick: onClick}, React.createElement("div", {className: "logo"}, React.createElement(svg_icon_1.SvgIcon, {svg: svg})));
    }
}
exports.NavLogo = NavLogo;
