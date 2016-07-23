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
require('./string-filter-menu.css');
const React = require('react');
const plywood_1 = require('plywood');
const constants_1 = require('../../config/constants');
const index_1 = require('../../../common/models/index');
const general_1 = require('../../../common/utils/general/general');
const dom_1 = require('../../utils/dom/dom');
const clearable_input_1 = require('../clearable-input/clearable-input');
const checkbox_1 = require('../checkbox/checkbox');
const loader_1 = require('../loader/loader');
const query_error_1 = require('../query-error/query-error');
const highlight_string_1 = require('../highlight-string/highlight-string');
const button_1 = require('../button/button');
const filter_options_dropdown_1 = require('../filter-options-dropdown/filter-options-dropdown');
const TOP_N = 100;
class StringFilterMenu extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: false,
            dataset: null,
            error: null,
            fetchQueued: false,
            searchText: '',
            selectedValues: null,
            promotedValues: null,
            colors: null
        };
        this.collectTriggerSearch = general_1.collect(constants_1.SEARCH_WAIT, () => {
            if (!this.mounted)
                return;
            var { essence, dimension } = this.props;
            this.fetchData(essence, dimension);
        });
        this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
    }
    fetchData(essence, dimension) {
        var { searchText } = this.state;
        var { dataCube } = essence;
        var nativeCount = dataCube.getMeasure('count');
        var measureExpression = nativeCount ? nativeCount.expression : plywood_1.$('main').count();
        var filterExpression = essence.getEffectiveFilter(null, dimension).toExpression();
        if (searchText) {
            filterExpression = filterExpression.and(dimension.expression.contains(plywood_1.r(searchText), 'ignoreCase'));
        }
        var query = plywood_1.$('main')
            .filter(filterExpression)
            .split(dimension.expression, dimension.name)
            .apply('MEASURE', measureExpression)
            .sort(plywood_1.$('MEASURE'), plywood_1.SortAction.DESCENDING)
            .limit(TOP_N + 1);
        this.setState({
            loading: true,
            fetchQueued: false
        });
        dataCube.executor(query, { timezone: essence.timezone })
            .then((dataset) => {
            if (!this.mounted)
                return;
            this.setState({
                loading: false,
                dataset: dataset,
                error: null
            });
        }, (error) => {
            if (!this.mounted)
                return;
            this.setState({
                loading: false,
                dataset: null,
                error: error
            });
        });
    }
    componentWillMount() {
        var { essence, dimension } = this.props;
        var { filter, colors } = essence;
        var myColors = (colors && colors.dimension === dimension.name ? colors : null);
        var valueSet = filter.getLiteralSet(dimension.expression);
        var selectedValues = valueSet || (myColors ? myColors.toSet() : null) || plywood_1.Set.EMPTY;
        this.setState({
            selectedValues: selectedValues,
            promotedValues: selectedValues,
            colors: myColors
        });
        this.fetchData(essence, dimension);
        if (colors) {
            this.setState({ filterMode: index_1.Filter.INCLUDED });
        }
        else {
            var filterMode = essence.filter.getModeForDimension(dimension);
            if (filterMode)
                this.setState({ filterMode: filterMode });
        }
    }
    // This is never called : either the component is open and nothing else can update its props,
    // or it's closed and doesn't exist.
    componentWillReceiveProps(nextProps) {
        var { essence, dimension } = this.props;
        var nextEssence = nextProps.essence;
        var nextDimension = nextProps.dimension;
        if (essence.differentDataCube(nextEssence) ||
            essence.differentEffectiveFilter(nextEssence, null, nextDimension) || !dimension.equals(nextDimension)) {
            this.fetchData(nextEssence, nextDimension);
        }
    }
    componentDidMount() {
        this.mounted = true;
        window.addEventListener('keydown', this.globalKeyDownListener);
    }
    componentWillUnmount() {
        this.mounted = false;
        window.removeEventListener('keydown', this.globalKeyDownListener);
    }
    globalKeyDownListener(e) {
        if (dom_1.enterKey(e)) {
            this.onOkClick();
        }
    }
    constructFilter() {
        var { essence, dimension, changePosition } = this.props;
        var { selectedValues, filterMode } = this.state;
        var { filter } = essence;
        if (selectedValues.size()) {
            var clause = new index_1.FilterClause({
                expression: dimension.expression,
                selection: plywood_1.r(selectedValues),
                exclude: filterMode === index_1.Filter.EXCLUDED
            });
            if (changePosition) {
                if (changePosition.isInsert()) {
                    return filter.insertByIndex(changePosition.insert, clause);
                }
                else {
                    return filter.replaceByIndex(changePosition.replace, clause);
                }
            }
            else {
                return filter.setClause(clause);
            }
        }
        else {
            return filter.remove(dimension.expression);
        }
    }
    onSearchChange(text) {
        var { searchText, dataset, fetchQueued, loading } = this.state;
        var newSearchText = text.substr(0, constants_1.MAX_SEARCH_LENGTH);
        // If the user is just typing in more and there are already < TOP_N results then there is nothing to do
        if (newSearchText.indexOf(searchText) !== -1 && !fetchQueued && !loading && dataset && dataset.data.length < TOP_N) {
            this.setState({
                searchText: newSearchText
            });
            return;
        }
        this.setState({
            searchText: newSearchText,
            fetchQueued: true
        });
        this.collectTriggerSearch();
    }
    onValueClick(value, e) {
        var { selectedValues, colors } = this.state;
        if (colors) {
            colors = colors.toggle(value);
            selectedValues = selectedValues.toggle(value);
        }
        else {
            if (e.altKey || e.ctrlKey || e.metaKey) {
                if (selectedValues.contains(value) && selectedValues.size() === 1) {
                    selectedValues = plywood_1.Set.EMPTY;
                }
                else {
                    selectedValues = plywood_1.Set.EMPTY.add(value);
                }
            }
            else {
                selectedValues = selectedValues.toggle(value);
            }
        }
        this.setState({
            selectedValues: selectedValues,
            colors: colors
        });
    }
    onOkClick() {
        if (!this.actionEnabled())
            return;
        var { clicker, onClose } = this.props;
        var { colors } = this.state;
        clicker.changeFilter(this.constructFilter(), colors);
        onClose();
    }
    onCancelClick() {
        var { onClose } = this.props;
        onClose();
    }
    actionEnabled() {
        var { essence } = this.props;
        return !essence.filter.equals(this.constructFilter());
    }
    onSelectFilterOption(filterMode) {
        this.setState({ filterMode: filterMode });
    }
    renderTable() {
        var { loading, dataset, error, fetchQueued, searchText, selectedValues, promotedValues, filterMode } = this.state;
        var { dimension } = this.props;
        var rows = [];
        var hasMore = false;
        if (dataset) {
            hasMore = dataset.data.length > TOP_N;
            var promotedElements = promotedValues ? promotedValues.elements : [];
            var rowData = dataset.data.slice(0, TOP_N).filter((d) => {
                return promotedElements.indexOf(d[dimension.name]) === -1;
            });
            var rowStrings = promotedElements.concat(rowData.map((d) => d[dimension.name]));
            if (searchText) {
                var searchTextLower = searchText.toLowerCase();
                rowStrings = rowStrings.filter((d) => {
                    return String(d).toLowerCase().indexOf(searchTextLower) !== -1;
                });
            }
            var checkboxType = filterMode === index_1.Filter.EXCLUDED ? 'cross' : 'check';
            rows = rowStrings.map((segmentValue) => {
                var segmentValueStr = String(segmentValue);
                var selected = selectedValues && selectedValues.contains(segmentValue);
                return React.createElement("div", {className: dom_1.classNames('row', { 'selected': selected }), key: segmentValueStr, title: segmentValueStr, onClick: this.onValueClick.bind(this, segmentValue)}, React.createElement("div", {className: "row-wrapper"}, React.createElement(checkbox_1.Checkbox, {type: checkboxType, selected: selected}), React.createElement(highlight_string_1.HighlightString, {className: "label", text: segmentValueStr, highlightText: searchText})));
            });
        }
        var message = null;
        if (!loading && dataset && !fetchQueued && searchText && !rows.length) {
            message = React.createElement("div", {className: "message"}, 'No results for "' + searchText + '"');
        }
        return React.createElement("div", {className: dom_1.classNames('menu-table', hasMore ? 'has-more' : 'no-more')}, React.createElement("div", {className: "side-by-side"}, React.createElement(filter_options_dropdown_1.FilterOptionsDropdown, {selectedOption: filterMode, onSelectOption: this.onSelectFilterOption.bind(this)}), React.createElement("div", {className: "search-box"}, React.createElement(clearable_input_1.ClearableInput, {placeholder: "Search", focusOnMount: true, value: searchText, onChange: this.onSearchChange.bind(this)}))), React.createElement("div", {className: "rows"}, rows, message), error ? React.createElement(query_error_1.QueryError, {error: error}) : null, loading ? React.createElement(loader_1.Loader, null) : null);
    }
    render() {
        var { dimension } = this.props;
        if (!dimension)
            return null;
        return React.createElement("div", {className: "string-filter-menu"}, this.renderTable(), React.createElement("div", {className: "button-bar"}, React.createElement(button_1.Button, {type: "primary", title: constants_1.STRINGS.ok, onClick: this.onOkClick.bind(this), disabled: !this.actionEnabled()}), React.createElement(button_1.Button, {type: "secondary", title: constants_1.STRINGS.cancel, onClick: this.onCancelClick.bind(this)})));
    }
}
exports.StringFilterMenu = StringFilterMenu;
