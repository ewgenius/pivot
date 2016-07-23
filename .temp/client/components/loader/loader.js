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
require('./loader.css');
const React = require('react');
const svg_icon_1 = require('../svg-icon/svg-icon');
class Loader extends React.Component {
    constructor() {
        super();
    }
    render() {
        return React.createElement("div", {className: "loader"}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/grid-loader.svg')}));
    }
}
exports.Loader = Loader;
