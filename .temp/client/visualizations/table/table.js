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
require('./table.css');
const immutable_1 = require('immutable');
const React = require('react');
const plywood_1 = require('plywood');
const formatter_1 = require('../../../common/utils/formatter/formatter');
const index_1 = require('../../../common/models/index');
const table_1 = require('../../../common/manifests/table/table');
const dom_1 = require('../../utils/dom/dom');
const svg_icon_1 = require('../../components/svg-icon/svg-icon');
const segment_bubble_1 = require('../../components/segment-bubble/segment-bubble');
const scroller_1 = require('../../components/scroller/scroller');
const base_visualization_1 = require('../base-visualization/base-visualization');
const HEADER_HEIGHT = 38;
const SEGMENT_WIDTH = 300;
const INDENT_WIDTH = 25;
const MEASURE_WIDTH = 130;
const ROW_HEIGHT = 30;
const SPACE_LEFT = 10;
const SPACE_RIGHT = 10;
const HIGHLIGHT_BUBBLE_V_OFFSET = -4;
function formatSegment(value) {
    if (plywood_1.TimeRange.isTimeRange(value)) {
        return value.start.toISOString();
    }
    else if (plywood_1.NumberRange.isNumberRange(value)) {
        return formatter_1.formatNumberRange(value);
    }
    return String(value);
}
function getFilterFromDatum(splits, flatDatum, dataCube) {
    if (flatDatum['__nest'] === 0)
        return null;
    var segments = [];
    while (flatDatum['__nest'] > 0) {
        segments.unshift(flatDatum[splits.get(flatDatum['__nest'] - 1).getDimension(dataCube.dimensions).name]);
        flatDatum = flatDatum['__parent'];
    }
    return new index_1.Filter(immutable_1.List(segments.map((segment, i) => {
        return new index_1.FilterClause({
            expression: splits.get(i).expression,
            selection: plywood_1.r(plywood_1.TimeRange.isTimeRange(segment) ? segment : plywood_1.Set.fromJS([segment]))
        });
    })));
}
class Table extends base_visualization_1.BaseVisualization {
    constructor() {
        super();
    }
    getDefaultState() {
        var s = super.getDefaultState();
        s.flatData = null;
        s.hoverRow = null;
        return s;
    }
    calculateMousePosition(x, y) {
        var { essence } = this.props;
        var { flatData } = this.state;
        if (x <= SPACE_LEFT)
            return { what: 'space-left' };
        x -= SPACE_LEFT;
        if (y <= HEADER_HEIGHT) {
            if (x <= SEGMENT_WIDTH)
                return { what: 'corner' };
            x = x - SEGMENT_WIDTH;
            var measureWidth = this.getIdealMeasureWidth(this.props.essence);
            var measureIndex = Math.floor(x / measureWidth);
            var measure = essence.getEffectiveMeasures().get(measureIndex);
            if (!measure)
                return { what: 'whitespace' };
            return { what: 'header', measure: measure };
        }
        y = y - HEADER_HEIGHT;
        var rowIndex = Math.floor(y / ROW_HEIGHT);
        var datum = flatData ? flatData[rowIndex] : null;
        if (!datum)
            return { what: 'whitespace' };
        return { what: 'row', row: datum };
    }
    onClick(x, y) {
        var { clicker, essence } = this.props;
        var { splits, dataCube } = essence;
        var pos = this.calculateMousePosition(x, y);
        if (pos.what === 'corner' || pos.what === 'header') {
            var sortExpression = plywood_1.$(pos.what === 'corner' ? index_1.SplitCombine.SORT_ON_DIMENSION_PLACEHOLDER : pos.measure.name);
            var commonSort = essence.getCommonSort();
            var myDescending = (commonSort && commonSort.expression.equals(sortExpression) && commonSort.direction === plywood_1.SortAction.DESCENDING);
            clicker.changeSplits(essence.splits.changeSortActionFromNormalized(new plywood_1.SortAction({
                expression: sortExpression,
                direction: myDescending ? plywood_1.SortAction.ASCENDING : plywood_1.SortAction.DESCENDING
            }), essence.dataCube.dimensions), index_1.VisStrategy.KeepAlways);
        }
        else if (pos.what === 'row') {
            var rowHighlight = getFilterFromDatum(essence.splits, pos.row, dataCube);
            if (!rowHighlight)
                return;
            if (essence.highlightOn(Table.id)) {
                if (rowHighlight.equals(essence.highlight.delta)) {
                    clicker.dropHighlight();
                    return;
                }
            }
            clicker.changeHighlight(Table.id, null, rowHighlight);
        }
    }
    onMouseMove(x, y) {
        var { hoverMeasure, hoverRow } = this.state;
        var pos = this.calculateMousePosition(x, y);
        if (hoverMeasure !== pos.measure || hoverRow !== pos.row) {
            this.setState({
                hoverMeasure: pos.measure,
                hoverRow: pos.row
            });
        }
    }
    onMouseLeave() {
        var { hoverMeasure, hoverRow } = this.state;
        if (hoverMeasure || hoverRow) {
            this.setState({
                hoverMeasure: null,
                hoverRow: null
            });
        }
    }
    precalculate(props, datasetLoad = null) {
        const { registerDownloadableDataset, essence } = props;
        const { splits } = essence;
        var existingDatasetLoad = this.state.datasetLoad;
        var newState = {};
        if (datasetLoad) {
            // Always keep the old dataset while loading (for now)
            if (datasetLoad.loading)
                datasetLoad.dataset = existingDatasetLoad.dataset;
            newState.datasetLoad = datasetLoad;
        }
        else {
            datasetLoad = this.state.datasetLoad;
        }
        var { dataset } = datasetLoad;
        if (dataset && splits.length()) {
            if (registerDownloadableDataset)
                registerDownloadableDataset(dataset);
            newState.flatData = dataset.flatten({
                order: 'preorder',
                nestingName: '__nest',
                parentName: '__parent'
            });
        }
        this.setState(newState);
    }
    getScalesForColumns(essence, flatData) {
        var measuresArray = essence.getEffectiveMeasures().toArray();
        var splitLength = essence.splits.length();
        return measuresArray.map(measure => {
            var measureValues = flatData
                .filter((d) => d['__nest'] === splitLength)
                .map((d) => d[measure.name]);
            // Ensure that 0 is in there
            measureValues.push(0);
            return d3.scale.linear()
                .domain(d3.extent(measureValues))
                .range([0, 100]); // really those are percents
        });
    }
    getFormattersFromMeasures(essence, flatData) {
        var measuresArray = essence.getEffectiveMeasures().toArray();
        return measuresArray.map(measure => {
            var measureName = measure.name;
            var measureValues = flatData.map((d) => d[measureName]);
            return formatter_1.formatterFromData(measureValues, measure.format);
        });
    }
    getIdealMeasureWidth(essence) {
        var availableWidth = this.props.stage.width - SPACE_LEFT - SEGMENT_WIDTH;
        var columnsCount = essence.getEffectiveMeasures().size;
        return columnsCount * MEASURE_WIDTH >= availableWidth ? MEASURE_WIDTH : availableWidth / columnsCount;
    }
    makeMeasuresRenderer(essence, formatters, hScales) {
        var measuresArray = essence.getEffectiveMeasures().toArray();
        var idealWidth = this.getIdealMeasureWidth(essence);
        var splitLength = essence.splits.length();
        var isSingleMeasure = measuresArray.length === 1;
        var className = dom_1.classNames('measure', { 'all-alone': !!isSingleMeasure });
        return (datum) => {
            return measuresArray.map((measure, i) => {
                var measureValue = datum[measure.name];
                var measureValueStr = formatters[i](measureValue);
                var background = null;
                if (datum['__nest'] === splitLength) {
                    let backgroundWidth = hScales[i](measureValue);
                    background = React.createElement("div", {className: "background-container"}, React.createElement("div", {className: "background", style: { width: backgroundWidth + '%' }}));
                }
                return React.createElement("div", {className: className, key: measure.name, style: { width: idealWidth }}, background, React.createElement("div", {className: "label"}, measureValueStr));
            });
        };
    }
    renderRow(index, rowMeasures, style, rowClass) {
        return React.createElement("div", {className: 'row ' + rowClass, key: '_' + index, style: style}, rowMeasures);
    }
    renderHeaderColumns(essence, hoverMeasure, measureWidth) {
        var commonSort = essence.getCommonSort();
        var commonSortName = commonSort ? commonSort.expression.name : null;
        var sortArrowIcon = commonSort ? React.createElement(svg_icon_1.SvgIcon, {
            svg: require('../../icons/sort-arrow.svg'),
            className: 'sort-arrow ' + commonSort.direction
        }) : null;
        return essence.getEffectiveMeasures().toArray().map((measure, i) => {
            let amISorted = commonSortName === measure.name;
            return React.createElement("div", {className: dom_1.classNames('measure-name', { hover: measure === hoverMeasure, sorted: amISorted }), key: measure.name, style: { width: measureWidth }}, React.createElement("div", {className: "title-wrap"}, measure.title), amISorted ? sortArrowIcon : null);
        });
    }
    renderCornerSortArrow(essence) {
        var commonSort = essence.getCommonSort();
        if (!commonSort)
            return null;
        if (commonSort.refName() === index_1.SplitCombine.SORT_ON_DIMENSION_PLACEHOLDER) {
            return React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/sort-arrow.svg'), className: 'sort-arrow ' + commonSort.direction});
        }
        return null;
    }
    onSimpleScroll(scrollTop, scrollLeft) {
        this.setState({ scrollLeft: scrollLeft, scrollTop: scrollTop });
    }
    getVisibleIndices(rowCount, height) {
        const { scrollTop } = this.state;
        return [
            Math.max(0, Math.floor(scrollTop / ROW_HEIGHT)),
            Math.min(rowCount, Math.ceil((scrollTop + height) / ROW_HEIGHT))
        ];
    }
    renderInternals() {
        var { clicker, essence, stage, openRawDataModal } = this.props;
        var { flatData, scrollTop, hoverMeasure, hoverRow } = this.state;
        var { splits, dataCube } = essence;
        var segmentTitle = splits.getTitle(essence.dataCube.dimensions);
        var cornerSortArrow = this.renderCornerSortArrow(essence);
        var idealWidth = this.getIdealMeasureWidth(essence);
        var headerColumns = this.renderHeaderColumns(essence, hoverMeasure, idealWidth);
        var rowWidth = idealWidth * headerColumns.length;
        var segments = [];
        var rows = [];
        var highlighter = null;
        var highlighterStyle = null;
        var highlightBubble = null;
        if (flatData) {
            var formatters = this.getFormattersFromMeasures(essence, flatData);
            var hScales = this.getScalesForColumns(essence, flatData);
            var highlightDelta = null;
            if (essence.highlightOn(Table.id)) {
                highlightDelta = essence.highlight.delta;
            }
            const [skipNumber, lastElementToShow] = this.getVisibleIndices(flatData.length, stage.height);
            const measuresRenderer = this.makeMeasuresRenderer(essence, formatters, hScales);
            var rowY = skipNumber * ROW_HEIGHT;
            for (var i = skipNumber; i < lastElementToShow; i++) {
                var d = flatData[i];
                var nest = d['__nest'];
                var split = nest > 0 ? splits.get(nest - 1) : null;
                var dimension = split ? split.getDimension(dataCube.dimensions) : null;
                var segmentValue = dimension ? d[dimension.name] : '';
                var segmentName = nest ? formatSegment(segmentValue) : 'Total';
                var left = Math.max(0, nest - 1) * INDENT_WIDTH;
                var segmentStyle = { left: left, width: SEGMENT_WIDTH - left, top: rowY };
                var hoverClass = d === hoverRow ? 'hover' : null;
                var selected = false;
                var selectedClass = '';
                if (highlightDelta) {
                    selected = highlightDelta.equals(getFilterFromDatum(splits, d, dataCube));
                    selectedClass = selected ? 'selected' : 'not-selected';
                }
                var nestClass = `nest${nest}`;
                segments.push(React.createElement("div", {className: dom_1.classNames('segment', nestClass, selectedClass, hoverClass), key: '_' + i, style: segmentStyle}, segmentName));
                let rowMeasures = measuresRenderer(d);
                let rowClass = dom_1.classNames(nestClass, selectedClass, hoverClass);
                let rowStyle = { top: rowY, width: rowWidth };
                rows.push(this.renderRow(i, rowMeasures, rowStyle, rowClass));
                if (!highlighter && selected) {
                    highlighterStyle = {
                        top: rowY - scrollTop,
                        left: left
                    };
                    var dimension = essence.dataCube.getDimensionByExpression(splits.splitCombines.get(nest - 1).expression);
                    highlighter = React.createElement("div", {className: 'highlighter', key: 'highlight', style: highlighterStyle});
                    highlightBubble = React.createElement(segment_bubble_1.SegmentBubble, {left: stage.x + stage.width / 2, top: stage.y + HEADER_HEIGHT + rowY - scrollTop - HIGHLIGHT_BUBBLE_V_OFFSET, segmentLabel: segmentName, dimension: dimension, clicker: clicker, openRawDataModal: openRawDataModal});
                }
                rowY += ROW_HEIGHT;
            }
        }
        var measureWidth = this.getIdealMeasureWidth(essence);
        const segmentLabels = React.createElement("div", {className: "segment-labels"}, segments);
        // added extra wrapping div for pin full and single parent
        const overlay = React.createElement("div", {className: "highlight-cont"}, React.createElement("div", {className: "highlight"}, highlighter));
        const corner = React.createElement("div", {className: "corner"}, React.createElement("div", {className: "corner-wrap"}, segmentTitle), cornerSortArrow);
        const scrollerLayout = {
            // Inner dimensions
            bodyWidth: measureWidth * essence.getEffectiveMeasures().size + SPACE_RIGHT,
            bodyHeight: flatData ? flatData.length * ROW_HEIGHT : 0,
            // Gutters
            top: HEADER_HEIGHT,
            right: 0,
            bottom: 0,
            left: SEGMENT_WIDTH
        };
        return React.createElement("div", {className: "internals table-inner"}, React.createElement(scroller_1.Scroller, {ref: "scroller", layout: scrollerLayout, topGutter: headerColumns, leftGutter: segmentLabels, topLeftCorner: corner, body: rows, overlay: overlay, onClick: this.onClick.bind(this), onMouseMove: this.onMouseMove.bind(this), onMouseLeave: this.onMouseLeave.bind(this), onScroll: this.onSimpleScroll.bind(this)}), highlightBubble);
    }
}
Table.id = table_1.TABLE_MANIFEST.name;
exports.Table = Table;
