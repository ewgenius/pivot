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
require('./no-data-cubes-application.css');
const React = require('react');
const constants_1 = require('../../config/constants');
const svg_icon_1 = require('../svg-icon/svg-icon');
class NoDataCubesApplication extends React.Component {
    constructor() {
        super();
    }
    componentDidMount() {
        this.refreshTimer = setInterval(() => {
            window.location.reload(true);
        }, 10000);
    }
    componentWillUnmount() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    render() {
        return React.createElement("div", {className: "no-data-cubes-application"}, React.createElement("div", {className: "icon"}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/data-cubes.svg')})), React.createElement("p", null, constants_1.STRINGS.noQueryableDataCubes));
    }
}
exports.NoDataCubesApplication = NoDataCubesApplication;
