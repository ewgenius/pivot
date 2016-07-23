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
require('./pinboard-measure-tile.css');
const React = require('react');
const index_1 = require('../../../common/models/index');
const dropdown_1 = require('../dropdown/dropdown');
class PinboardMeasureTile extends React.Component {
    constructor() {
        super();
    }
    render() {
        var { essence, title, dimension, sortOn, onSelect } = this.props;
        var sortOns = (dimension ? [index_1.SortOn.fromDimension(dimension)] : []).concat(essence.dataCube.measures.toArray().map(index_1.SortOn.fromMeasure));
        const SortOnDropdown = dropdown_1.Dropdown.specialize();
        return React.createElement("div", {className: "pinboard-measure-tile"}, React.createElement("div", {className: "title"}, title), React.createElement(SortOnDropdown, {items: sortOns, selectedItem: sortOn, equal: index_1.SortOn.equal, renderItem: index_1.SortOn.getTitle, keyItem: index_1.SortOn.getName, onSelect: onSelect}));
    }
}
exports.PinboardMeasureTile = PinboardMeasureTile;
