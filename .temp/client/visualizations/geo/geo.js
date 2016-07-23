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
require('./geo.css');
const React = require('react');
const geo_1 = require('../../../common/manifests/geo/geo');
const base_visualization_1 = require('../base-visualization/base-visualization');
class Geo extends base_visualization_1.BaseVisualization {
    constructor() {
        super();
    }
    getDefaultState() {
        return super.getDefaultState();
    }
    componentWillMount() { }
    componentDidMount() { }
    componentWillReceiveProps(nextProps) { }
    renderInternals() {
        return React.createElement("div", {className: "internals"});
    }
}
Geo.id = geo_1.GEO_MANIFEST.name;
exports.Geo = Geo;
