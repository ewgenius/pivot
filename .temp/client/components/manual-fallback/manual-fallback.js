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
require('./manual-fallback.css');
const React = require('react');
const index_1 = require('../../../common/models/index');
class ManualFallback extends React.Component {
    constructor() {
        super();
    }
    onResolutionClick(resolution) {
        var { clicker } = this.props;
        clicker.changeSplits(resolution.adjustment.splits, index_1.VisStrategy.KeepAlways);
    }
    render() {
        var { essence } = this.props;
        var { visResolve } = essence;
        if (!visResolve.isManual())
            return null;
        var resolutionItems = visResolve.resolutions.map((resolution, i) => {
            return React.createElement("li", {key: i, onClick: this.onResolutionClick.bind(this, resolution)}, resolution.description);
        });
        return React.createElement("div", {className: "manual-fallback"}, React.createElement("div", {className: "message"}, visResolve.message), React.createElement("ul", null, resolutionItems));
    }
}
exports.ManualFallback = ManualFallback;
