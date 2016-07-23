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
require('./filter-options-dropdown.css');
const React = require('react');
const constants_1 = require('../../config/constants');
const index_1 = require('../../../common/models/index');
const dropdown_1 = require("../dropdown/dropdown");
const svg_icon_1 = require('../svg-icon/svg-icon');
const FILTER_OPTIONS = [
    {
        label: constants_1.STRINGS.include,
        value: index_1.Filter.INCLUDED,
        svg: require('../../icons/filter-include.svg'),
        checkType: 'check'
    },
    {
        label: constants_1.STRINGS.exclude,
        value: index_1.Filter.EXCLUDED,
        svg: require('../../icons/filter-exclude.svg'),
        checkType: 'cross'
    }
];
class FilterOptionsDropdown extends React.Component {
    constructor() {
        super();
    }
    onSelectOption(option) {
        this.props.onSelectOption(option.value);
    }
    renderFilterOption(option) {
        return React.createElement("span", {className: "filter-option"}, React.createElement(svg_icon_1.SvgIcon, {className: "icon", svg: option.svg}), React.createElement("span", {className: "option-label"}, option.label));
    }
    render() {
        var { selectedOption, onSelectOption } = this.props;
        const FilterDropdown = dropdown_1.Dropdown.specialize();
        var selectedItem = FILTER_OPTIONS.filter(o => o.value === selectedOption)[0] || FILTER_OPTIONS[0];
        return React.createElement("div", {className: "filter-options-dropdown"}, React.createElement(FilterDropdown, {menuClassName: "filter-options", items: FILTER_OPTIONS, selectedItem: selectedItem, equal: (a, b) => a.value === b.value, keyItem: (d) => d.value, renderItem: this.renderFilterOption.bind(this), renderSelectedItem: (d) => React.createElement(svg_icon_1.SvgIcon, {className: "icon", svg: d.svg}), onSelect: this.onSelectOption.bind(this)}));
    }
}
exports.FilterOptionsDropdown = FilterOptionsDropdown;
