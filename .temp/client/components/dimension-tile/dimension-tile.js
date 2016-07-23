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
require('./dimension-tile.css');
const React = require('react');
const plywood_1 = require('plywood');
const index_1 = require('../../../common/utils/index');
const index_2 = require('../../../common/models/index');
const dom_1 = require('../../utils/dom/dom');
const drag_manager_1 = require('../../utils/drag-manager/drag-manager');
const constants_1 = require('../../config/constants');
const constants_2 = require('../../config/constants');
const svg_icon_1 = require('../svg-icon/svg-icon');
const checkbox_1 = require('../checkbox/checkbox');
const loader_1 = require('../loader/loader');
const query_error_1 = require('../query-error/query-error');
const highlight_string_1 = require('../highlight-string/highlight-string');
const searchable_tile_1 = require('../searchable-tile/searchable-tile');
const TOP_N = 100;
const FOLDER_BOX_HEIGHT = 30;
class DimensionTile extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: false,
            dataset: null,
            error: null,
            fetchQueued: false,
            unfolded: true,
            foldable: false,
            showSearch: false,
            selectedGranularity: null,
            searchText: ''
        };
        this.collectTriggerSearch = index_1.collect(constants_2.SEARCH_WAIT, () => {
            if (!this.mounted)
                return;
            var { essence, dimension, sortOn } = this.props;
            var { unfolded } = this.state;
            this.fetchData(essence, dimension, sortOn, unfolded);
        });
    }
    fetchData(essence, dimension, sortOn, unfolded, selectedGranularity) {
        var { searchText } = this.state;
        var { dataCube, colors } = essence;
        var filter = essence.getEffectiveFilter();
        // don't remove filter if time
        if (unfolded && dimension !== essence.getTimeDimension()) {
            filter = filter.remove(dimension.expression);
        }
        filter = filter.setExclusionforDimension(false, dimension);
        var filterExpression = filter.toExpression();
        if (!unfolded && colors && colors.dimension === dimension.name && colors.values) {
            filterExpression = filterExpression.and(dimension.expression.in(colors.toSet()));
        }
        if (searchText) {
            filterExpression = filterExpression.and(dimension.expression.contains(plywood_1.r(searchText), 'ignoreCase'));
        }
        var query = plywood_1.$('main')
            .filter(filterExpression);
        var sortExpression = null;
        if (dimension.isContinuous()) {
            const dimensionExpression = dimension.expression;
            const attributeName = dimensionExpression.name;
            const filterSelection = essence.filter.getSelection(dimensionExpression);
            if (!selectedGranularity) {
                if (filterSelection) {
                    var range = dimension.kind === 'time' ? essence.evaluateSelection(filterSelection) : filterSelection.getLiteralValue().extent();
                    selectedGranularity = index_2.getBestGranularityForRange(range, true, dimension.bucketedBy, dimension.granularities);
                }
                else {
                    selectedGranularity = index_2.getDefaultGranularityForKind(dimension.kind, dimension.bucketedBy, dimension.granularities);
                }
            }
            this.setState({ selectedGranularity: selectedGranularity });
            query = query.split(plywood_1.$(attributeName).performAction(selectedGranularity), dimension.name);
            sortExpression = plywood_1.$(dimension.name);
        }
        else {
            query = query.split(dimension.expression, dimension.name);
            sortExpression = sortOn.getExpression();
        }
        if (sortOn.measure) {
            query = query.performAction(sortOn.measure.toApplyAction());
        }
        query = query.sort(sortExpression, plywood_1.SortAction.DESCENDING).limit(TOP_N + 1);
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
    updateFoldability(essence, dimension, colors) {
        var { unfolded } = this.state;
        var foldable = true;
        if (essence.filter.filteredOn(dimension.expression)) {
            if (colors) {
                foldable = false;
                unfolded = false;
            }
            else if (dimension.kind === "time") {
                foldable = false;
                unfolded = true;
            }
        }
        else {
            if (!colors) {
                foldable = false;
                unfolded = true;
            }
        }
        this.setState({ foldable: foldable, unfolded: unfolded });
        return unfolded;
    }
    componentWillMount() {
        var { essence, dimension, colors, sortOn } = this.props;
        var unfolded = this.updateFoldability(essence, dimension, colors);
        this.fetchData(essence, dimension, sortOn, unfolded);
    }
    componentWillReceiveProps(nextProps) {
        var { essence, dimension, sortOn } = this.props;
        var { selectedGranularity } = this.state;
        var nextEssence = nextProps.essence;
        var nextDimension = nextProps.dimension;
        var nextColors = nextProps.colors;
        var nextSortOn = nextProps.sortOn;
        var unfolded = this.updateFoldability(nextEssence, nextDimension, nextColors);
        // keep granularity selection if measures change or if autoupdate
        var currentSelection = essence.getTimeSelection();
        var nextSelection = nextEssence.getTimeSelection();
        var differentTimeFilterSelection = currentSelection ? !currentSelection.equals(nextSelection) : Boolean(nextSelection);
        if (differentTimeFilterSelection) {
            // otherwise render will try to format exiting dataset based off of new granularity (before fetchData returns)
            this.setState({ dataset: null });
        }
        var persistedGranularity = differentTimeFilterSelection ? null : selectedGranularity;
        if (essence.differentDataCube(nextEssence) ||
            essence.differentEffectiveFilter(nextEssence, null, unfolded ? dimension : null) ||
            essence.differentColors(nextEssence) || !dimension.equals(nextDimension) || !sortOn.equals(nextSortOn) ||
            essence.differentTimezoneMatters(nextEssence) ||
            (!essence.timezone.equals(nextEssence.timezone)) && dimension.kind === 'time' ||
            differentTimeFilterSelection) {
            this.fetchData(nextEssence, nextDimension, nextSortOn, unfolded, persistedGranularity);
        }
        this.setFilterModeFromProps(nextProps);
    }
    setFilterModeFromProps(props) {
        if (props.colors) {
            this.setState({ filterMode: index_2.Filter.INCLUDED });
        }
        else {
            var filterMode = props.essence.filter.getModeForDimension(props.dimension);
            if (filterMode)
                this.setState({ filterMode: filterMode });
        }
    }
    componentDidMount() {
        this.mounted = true;
        this.setFilterModeFromProps(this.props);
    }
    componentWillUnmount() {
        this.mounted = false;
    }
    onRowClick(value, e) {
        var { clicker, essence, dimension, colors } = this.props;
        var { dataset, filterMode } = this.state;
        var { filter } = essence;
        if (colors && colors.dimension === dimension.name) {
            if (colors.limit) {
                if (!dataset)
                    return;
                var values = dataset.data.slice(0, colors.limit).map((d) => d[dimension.name]);
                colors = index_2.Colors.fromValues(colors.dimension, values);
            }
            colors = colors.toggle(value);
            if (filter.filteredOn(dimension.expression)) {
                filter = filter.toggleValue(dimension.expression, value);
                clicker.changeFilter(filter, colors);
            }
            else {
                clicker.changeColors(colors);
            }
        }
        else {
            if (e.altKey || e.ctrlKey || e.metaKey) {
                let filteredOnMe = filter.filteredOnValue(dimension.expression, value);
                let singleFilter = filter.getLiteralSet(dimension.expression).size() === 1;
                if (filteredOnMe && singleFilter) {
                    filter = filter.remove(dimension.expression);
                }
                else {
                    filter = filter.remove(dimension.expression).addValue(dimension.expression, value);
                }
            }
            else {
                filter = filter.toggleValue(dimension.expression, value);
            }
            // If no longer filtered switch unfolded to true for later
            var { unfolded } = this.state;
            if (!unfolded && !filter.filteredOn(dimension.expression)) {
                this.setState({ unfolded: true });
            }
            clicker.changeFilter(filter.setExclusionforDimension(filterMode === index_2.Filter.EXCLUDED, dimension));
        }
    }
    changeFilterMode(value) {
        const { clicker, essence, dimension } = this.props;
        this.setState({ filterMode: value }, () => {
            clicker.changeFilter(essence.filter.setExclusionforDimension(value === index_2.Filter.EXCLUDED, dimension));
        });
    }
    getFilterActions() {
        const { essence, dimension } = this.props;
        const { filterMode } = this.state;
        if (!essence || !dimension)
            return null;
        const filter = essence.filter;
        const options = [index_2.Filter.INCLUDED, index_2.Filter.EXCLUDED];
        return options.map((value) => {
            return {
                selected: filterMode === value,
                onSelect: this.changeFilterMode.bind(this, value),
                displayValue: constants_1.STRINGS[value],
                keyString: value
            };
        });
    }
    toggleFold() {
        var { essence, dimension, sortOn } = this.props;
        var { unfolded } = this.state;
        unfolded = !unfolded;
        this.setState({ unfolded: unfolded });
        this.fetchData(essence, dimension, sortOn, unfolded);
    }
    onDragStart(e) {
        var { essence, dimension, getUrlPrefix } = this.props;
        var newUrl = essence.changeSplit(index_2.SplitCombine.fromExpression(dimension.expression), index_2.VisStrategy.FairGame).getURL(getUrlPrefix());
        var dataTransfer = e.dataTransfer;
        dataTransfer.effectAllowed = 'all';
        dataTransfer.setData("text/url-list", newUrl);
        dataTransfer.setData("text/plain", newUrl);
        drag_manager_1.DragManager.setDragDimension(dimension, 'dimension-tile');
        dom_1.setDragGhost(dataTransfer, dimension.title);
    }
    toggleSearch() {
        var { showSearch } = this.state;
        this.setState({ showSearch: !showSearch });
        this.onSearchChange('');
    }
    onSearchChange(text) {
        var { searchText, dataset, fetchQueued, loading } = this.state;
        var newSearchText = text.substr(0, constants_2.MAX_SEARCH_LENGTH);
        if (searchText === newSearchText)
            return; // nothing to do;
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
    getTitleHeader() {
        const { dimension } = this.props;
        const { selectedGranularity } = this.state;
        if (selectedGranularity && dimension.kind === 'time') {
            var duration = selectedGranularity.duration;
            return `${dimension.title} (${duration.getDescription()})`;
        }
        return dimension.title;
    }
    onSelectGranularity(selectedGranularity) {
        if (selectedGranularity === this.state.selectedGranularity)
            return;
        var { essence, dimension, colors, sortOn } = this.props;
        var unfolded = this.updateFoldability(essence, dimension, colors);
        this.setState({ dataset: null });
        this.fetchData(essence, dimension, sortOn, unfolded, selectedGranularity);
    }
    getGranularityActions() {
        const { dimension } = this.props;
        const { selectedGranularity } = this.state;
        var granularities = dimension.granularities || index_2.getGranularities(dimension.kind, dimension.bucketedBy, true);
        return granularities.map((g) => {
            var granularityStr = index_2.granularityToString(g);
            return {
                selected: index_2.granularityEquals(selectedGranularity, g),
                onSelect: this.onSelectGranularity.bind(this, g),
                displayValue: index_1.formatGranularity(granularityStr),
                keyString: granularityStr
            };
        });
    }
    render() {
        const { clicker, essence, dimension, sortOn, colors, onClose } = this.props;
        const { loading, dataset, error, showSearch, unfolded, foldable, fetchQueued, searchText, selectedGranularity, filterMode } = this.state;
        const measure = sortOn.measure;
        const measureName = measure ? measure.name : null;
        const filterSet = essence.filter.getLiteralSet(dimension.expression);
        const continuous = dimension.isContinuous();
        const excluded = filterMode === index_2.Filter.EXCLUDED;
        var maxHeight = constants_2.PIN_TITLE_HEIGHT;
        var rows = [];
        var folder = null;
        var highlightControls = null;
        var hasMore = false;
        if (dataset) {
            hasMore = dataset.data.length > TOP_N;
            var rowData = dataset.data.slice(0, TOP_N);
            if (!unfolded) {
                if (filterSet) {
                    rowData = rowData.filter((d) => filterSet.contains(d[dimension.name]));
                }
                if (colors) {
                    if (colors.values) {
                        var colorsSet = colors.toSet();
                        rowData = rowData.filter((d) => colorsSet.contains(d[dimension.name]));
                    }
                    else {
                        rowData = rowData.slice(0, colors.limit);
                    }
                }
            }
            if (searchText) {
                var searchTextLower = searchText.toLowerCase();
                rowData = rowData.filter((d) => {
                    return String(d[dimension.name]).toLowerCase().indexOf(searchTextLower) !== -1;
                });
            }
            var colorValues = null;
            if (colors)
                colorValues = colors.getColors(rowData.map(d => d[dimension.name]));
            var formatter = measure ? index_1.formatterFromData(rowData.map(d => d[measureName]), measure.format) : null;
            rows = rowData.map((d, i) => {
                var segmentValue = d[dimension.name];
                var segmentValueStr = String(segmentValue);
                var className = 'row';
                var checkbox = null;
                if ((filterSet || colors) && !continuous) {
                    var selected;
                    if (colors) {
                        selected = false;
                        className += ' color';
                    }
                    else {
                        selected = essence.filter.filteredOnValue(dimension.expression, segmentValue);
                        className += ' ' + (selected ? 'selected' : 'not-selected');
                    }
                    checkbox = React.createElement(checkbox_1.Checkbox, {selected: selected, type: excluded ? 'cross' : 'check', color: colorValues ? colorValues[i] : null});
                }
                if (segmentValue instanceof plywood_1.TimeRange) {
                    segmentValueStr = index_1.formatTimeBasedOnGranularity(segmentValue, selectedGranularity.duration, essence.timezone, constants_1.getLocale());
                }
                else if (segmentValue instanceof plywood_1.NumberRange) {
                    segmentValueStr = index_1.formatNumberRange(segmentValue);
                }
                var measureValueElement = null;
                if (measure) {
                    measureValueElement = React.createElement("div", {className: "measure-value"}, formatter(d[measureName]));
                }
                var row = React.createElement("div", {className: className, key: segmentValueStr, onClick: this.onRowClick.bind(this, segmentValue)}, React.createElement("div", {className: "segment-value", title: segmentValueStr}, checkbox, React.createElement(highlight_string_1.HighlightString, {className: "label", text: segmentValueStr, highlightText: searchText})), measureValueElement, selected ? highlightControls : null);
                if (selected && highlightControls)
                    highlightControls = null; // place only once
                return row;
            });
            maxHeight += Math.max(2, rows.length) * constants_2.PIN_ITEM_HEIGHT;
            if (foldable) {
                folder = React.createElement("div", {className: dom_1.classNames('folder', unfolded ? 'folded' : 'unfolded'), onClick: this.toggleFold.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/caret.svg')}), unfolded ? 'Show selection' : 'Show all');
                maxHeight += FOLDER_BOX_HEIGHT;
            }
        }
        maxHeight += constants_2.PIN_PADDING_BOTTOM;
        var message = null;
        if (!loading && dataset && !fetchQueued && searchText && !rows.length) {
            message = React.createElement("div", {className: "message"}, `No results for "${searchText}"`);
        }
        const className = dom_1.classNames('dimension-tile', filterMode, (folder ? 'has-folder' : 'no-folder'), (colors ? 'has-colors' : 'no-colors'), { continuous: continuous });
        const style = {
            maxHeight: maxHeight
        };
        var icons = [{
                name: 'search',
                ref: 'search',
                onClick: this.toggleSearch.bind(this),
                svg: require('../../icons/full-search.svg'),
                active: showSearch
            },
            {
                name: 'close',
                onClick: onClose,
                svg: require('../../icons/full-remove.svg')
            }];
        var actions = null;
        if (continuous) {
            actions = this.getGranularityActions();
        }
        else if (!essence.colors) {
            actions = this.getFilterActions();
        }
        return React.createElement(searchable_tile_1.SearchableTile, {style: style, title: this.getTitleHeader(), toggleChangeFn: this.toggleSearch.bind(this), onDragStart: this.onDragStart.bind(this), onSearchChange: this.onSearchChange.bind(this), searchText: searchText, showSearch: showSearch, icons: icons, className: className, actions: actions}, React.createElement("div", {className: "rows"}, rows, message), folder, error ? React.createElement(query_error_1.QueryError, {error: error}) : null, loading ? React.createElement(loader_1.Loader, null) : null);
    }
}
exports.DimensionTile = DimensionTile;
