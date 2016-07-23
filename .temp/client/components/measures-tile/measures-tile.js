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
require('./measures-tile.css');
const React = require('react');
const constants_1 = require('../../config/constants');
const dom_1 = require('../../utils/dom/dom');
const localStorage = require('../../utils/local-storage/local-storage');
const checkbox_1 = require('../checkbox/checkbox');
const highlight_string_1 = require('../highlight-string/highlight-string');
const searchable_tile_1 = require('../searchable-tile/searchable-tile');
class MeasuresTile extends React.Component {
    constructor() {
        super();
        this.state = {
            showSearch: false,
            searchText: ''
        };
    }
    measureClick(measure, e) {
        if (e.altKey && typeof console !== 'undefined') {
            console.log(`Measure: ${measure.name}`);
            console.log(`expression: ${measure.expression.toString()}`);
            return;
        }
        var { clicker } = this.props;
        clicker.toggleEffectiveMeasure(measure);
    }
    toggleSearch() {
        var { showSearch } = this.state;
        this.setState({ showSearch: !showSearch });
        this.onSearchChange('');
    }
    onSearchChange(text) {
        var { searchText } = this.state;
        var newSearchText = text.substr(0, constants_1.MAX_SEARCH_LENGTH);
        if (searchText === newSearchText)
            return; // nothing to do;
        this.setState({
            searchText: newSearchText
        });
    }
    toggleMultiMeasure() {
        var { clicker, essence } = this.props;
        clicker.toggleMultiMeasureMode();
        localStorage.set('is-multi-measure', !essence.getEffectiveMultiMeasureMode());
    }
    render() {
        var { essence, style } = this.props;
        var { showSearch, searchText } = this.state;
        var { dataCube } = essence;
        var multiMeasureMode = essence.getEffectiveMultiMeasureMode();
        var selectedMeasures = essence.getEffectiveSelectedMeasure();
        var checkboxType = multiMeasureMode ? 'check' : 'radio';
        var shownMeasures = dataCube.measures.toArray();
        if (searchText) {
            shownMeasures = shownMeasures.filter((r) => {
                return r.title.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
            });
        }
        var rows = shownMeasures.map(measure => {
            var measureName = measure.name;
            var selected = selectedMeasures.has(measureName);
            return React.createElement("div", {className: dom_1.classNames('row', { selected: selected }), key: measureName, onClick: this.measureClick.bind(this, measure)}, React.createElement(checkbox_1.Checkbox, {type: checkboxType, selected: selected}), React.createElement(highlight_string_1.HighlightString, {className: "label", text: measure.title, highlightText: searchText}));
        });
        var message = null;
        if (searchText && !rows.length) {
            message = React.createElement("div", {className: "message"}, `No ${constants_1.STRINGS.measures.toLowerCase()} for "${searchText}"`);
        }
        var icons = [];
        if (!essence.isFixedMeasureMode()) {
            icons.push({
                name: 'multi',
                onClick: this.toggleMultiMeasure.bind(this),
                svg: require('../../icons/full-multi.svg'),
                active: multiMeasureMode
            });
        }
        icons.push({
            name: 'search',
            ref: 'search',
            onClick: this.toggleSearch.bind(this),
            svg: require('../../icons/full-search.svg'),
            active: showSearch
        });
        // More icons to add later
        //{ name: 'more', onClick: null, svg: require('../../icons/full-more-mini.svg') }
        return React.createElement(searchable_tile_1.SearchableTile, {style: style, title: constants_1.STRINGS.measures, toggleChangeFn: this.toggleSearch.bind(this), onSearchChange: this.onSearchChange.bind(this), searchText: searchText, showSearch: showSearch, icons: icons, className: 'measures-tile'}, React.createElement("div", {className: "rows"}, rows, message));
    }
    ;
}
exports.MeasuresTile = MeasuresTile;
