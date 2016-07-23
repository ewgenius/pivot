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
require('./line-chart.css');
const immutable_class_1 = require('immutable-class');
const React = require('react');
const ReactDOM = require('react-dom');
const d3 = require('d3');
const plywood_1 = require('plywood');
const index_1 = require('../../../common/models/index');
const line_chart_1 = require('../../../common/manifests/line-chart/line-chart');
const time_1 = require('../../../common/utils/time/time');
const formatter_1 = require('../../../common/utils/formatter/formatter');
const granularity_1 = require('../../../common/models/granularity/granularity');
const constants_1 = require('../../config/constants');
const dom_1 = require('../../utils/dom/dom');
const vis_measure_label_1 = require('../../components/vis-measure-label/vis-measure-label');
const chart_line_1 = require('../../components/chart-line/chart-line');
const line_chart_axis_1 = require('../../components/line-chart-axis/line-chart-axis');
const vertical_axis_1 = require('../../components/vertical-axis/vertical-axis');
const grid_lines_1 = require('../../components/grid-lines/grid-lines');
const highlighter_1 = require('../../components/highlighter/highlighter');
const segment_bubble_1 = require('../../components/segment-bubble/segment-bubble');
const hover_multi_bubble_1 = require('../../components/hover-multi-bubble/hover-multi-bubble');
const base_visualization_1 = require('../base-visualization/base-visualization');
const TEXT_SPACER = 36;
const X_AXIS_HEIGHT = 30;
const Y_AXIS_WIDTH = 60;
const MIN_CHART_HEIGHT = 140;
const HOVER_BUBBLE_V_OFFSET = -7;
const HOVER_MULTI_BUBBLE_V_OFFSET = -8;
const MAX_HOVER_DIST = 50;
const MAX_ASPECT_RATIO = 1; // width / height
function findClosest(data, dragDate, scaleX, continuousDimension) {
    var closestDatum = null;
    var minDist = Infinity;
    for (var datum of data) {
        var continuousSegmentValue = datum[continuousDimension.name];
        if (!continuousSegmentValue)
            continue;
        var mid = continuousSegmentValue.midpoint();
        var dist = Math.abs(mid.valueOf() - dragDate.valueOf());
        var distPx = Math.abs(scaleX(mid) - scaleX(dragDate));
        if ((!closestDatum || dist < minDist) && distPx < MAX_HOVER_DIST) {
            closestDatum = datum;
            minDist = dist;
        }
    }
    return closestDatum;
}
function roundTo(v, roundTo) {
    return Math.round(Math.floor(v / roundTo)) * roundTo;
}
class LineChart extends base_visualization_1.BaseVisualization {
    constructor() {
        super();
    }
    getDefaultState() {
        var s = super.getDefaultState();
        s.dragStartValue = null;
        s.dragRange = null;
        s.hoverRange = null;
        return s;
    }
    getMyEventX(e) {
        var myDOM = ReactDOM.findDOMNode(this);
        var rect = myDOM.getBoundingClientRect();
        return dom_1.getXFromEvent(e) - (rect.left + constants_1.VIS_H_PADDING);
    }
    onMouseDown(measure, e) {
        const { scaleX } = this.state;
        if (!scaleX)
            return;
        var dragStartValue = scaleX.invert(this.getMyEventX(e));
        this.setState({
            dragStartValue: dragStartValue,
            dragRange: null,
            dragOnMeasure: measure
        });
    }
    onMouseMove(dataset, measure, scaleX, e) {
        var { essence } = this.props;
        var { continuousDimension, hoverRange, hoverMeasure } = this.state;
        if (!dataset)
            return;
        var splitLength = essence.splits.length();
        var myDOM = ReactDOM.findDOMNode(this);
        var rect = myDOM.getBoundingClientRect();
        var dragDate = scaleX.invert(dom_1.getXFromEvent(e) - (rect.left + constants_1.VIS_H_PADDING));
        var closestDatum;
        if (splitLength > 1) {
            var flatData = dataset.flatten();
            closestDatum = findClosest(flatData, dragDate, scaleX, continuousDimension);
        }
        else {
            closestDatum = findClosest(dataset.data, dragDate, scaleX, continuousDimension);
        }
        var currentHoverRange = closestDatum ? (closestDatum[continuousDimension.name]) : null;
        if (!hoverRange || !immutable_class_1.immutableEqual(hoverRange, currentHoverRange) || measure !== hoverMeasure) {
            this.setState({
                hoverRange: currentHoverRange,
                hoverMeasure: measure
            });
        }
    }
    getDragRange(e) {
        const { dragStartValue, axisRange, scaleX } = this.state;
        var dragEndValue = scaleX.invert(this.getMyEventX(e));
        var rangeJS = null;
        if (dragStartValue.valueOf() === dragEndValue.valueOf()) {
            dragEndValue = plywood_1.TimeRange.isTimeRange(axisRange) ? new Date(dragEndValue.valueOf() + 1) : dragEndValue + 1;
        }
        if (dragStartValue < dragEndValue) {
            rangeJS = { start: dragStartValue, end: dragEndValue };
        }
        else {
            rangeJS = { start: dragEndValue, end: dragStartValue };
        }
        return plywood_1.Range.fromJS(rangeJS).intersect(axisRange);
    }
    floorRange(dragRange) {
        const { essence } = this.props;
        const { splits, timezone } = essence;
        var continuousSplit = splits.last();
        if (plywood_1.TimeRange.isTimeRange(dragRange)) {
            var timeBucketAction = continuousSplit.bucketAction;
            var duration = timeBucketAction.duration;
            return plywood_1.TimeRange.fromJS({
                start: duration.floor(dragRange.start, timezone),
                end: duration.shift(duration.floor(dragRange.end, timezone), timezone, 1)
            });
        }
        else {
            var numberBucketAction = continuousSplit.bucketAction;
            var bucketSize = numberBucketAction.size;
            var startFloored = roundTo(dragRange.start, bucketSize);
            var endFloored = roundTo(dragRange.end, bucketSize);
            if (endFloored - startFloored < bucketSize) {
                endFloored += bucketSize;
            }
            return plywood_1.NumberRange.fromJS({
                start: startFloored,
                end: endFloored
            });
        }
    }
    globalMouseMoveListener(e) {
        const { dragStartValue } = this.state;
        if (dragStartValue === null)
            return;
        var dragRange = this.getDragRange(e);
        this.setState({
            dragRange: dragRange,
            roundDragRange: this.floorRange(dragRange)
        });
    }
    globalMouseUpListener(e) {
        const { clicker, essence } = this.props;
        const { continuousDimension, dragStartValue, dragRange, dragOnMeasure } = this.state;
        if (dragStartValue === null)
            return;
        var highlightRange = this.floorRange(this.getDragRange(e));
        this.resetDrag();
        // If already highlighted and user clicks within it switches measure
        if (!dragRange && essence.highlightOn(LineChart.id)) {
            var existingHighlightRange = essence.getSingleHighlightSet().elements[0];
            if (existingHighlightRange.contains(highlightRange.start)) {
                var { highlight } = essence;
                if (highlight.measure === dragOnMeasure.name) {
                    clicker.dropHighlight();
                }
                else {
                    clicker.changeHighlight(LineChart.id, dragOnMeasure.name, highlight.delta);
                }
                return;
            }
        }
        clicker.changeHighlight(LineChart.id, dragOnMeasure.name, index_1.Filter.fromClause(new index_1.FilterClause({
            expression: continuousDimension.expression,
            selection: plywood_1.r(highlightRange)
        })));
    }
    globalKeyDownListener(e) {
        if (!dom_1.escapeKey(e))
            return;
        const { dragStartValue } = this.state;
        if (dragStartValue === null)
            return;
        this.resetDrag();
    }
    resetDrag() {
        this.setState({
            dragStartValue: null,
            dragRange: null,
            roundDragRange: null,
            dragOnMeasure: null
        });
    }
    onMouseLeave(measure, e) {
        const { hoverMeasure } = this.state;
        if (hoverMeasure === measure) {
            this.setState({
                hoverRange: null,
                hoverMeasure: null
            });
        }
    }
    renderHighlighter() {
        const { essence } = this.props;
        const { dragRange, scaleX } = this.state;
        if (dragRange !== null) {
            return React.createElement(highlighter_1.Highlighter, {highlightRange: dragRange, scaleX: scaleX});
        }
        if (essence.highlightOn(LineChart.id)) {
            var highlightRange = essence.getSingleHighlightSet().elements[0];
            return React.createElement(highlighter_1.Highlighter, {highlightRange: highlightRange, scaleX: scaleX});
        }
        return null;
    }
    renderChartBubble(dataset, measure, chartIndex, containerStage, chartStage, extentY, scaleY) {
        const { clicker, essence, openRawDataModal } = this.props;
        const { scrollTop, dragRange, roundDragRange, dragOnMeasure, hoverRange, hoverMeasure, scaleX, continuousDimension } = this.state;
        const { colors, timezone } = essence;
        if (essence.highlightOnDifferentMeasure(LineChart.id, measure.name))
            return null;
        var topOffset = chartStage.height * chartIndex + scaleY(extentY[1]) + TEXT_SPACER - scrollTop;
        if (topOffset < 0)
            return null;
        topOffset += containerStage.y;
        if ((dragRange && dragOnMeasure === measure) || (!dragRange && essence.highlightOn(LineChart.id, measure.name))) {
            var bubbleRange = dragRange || essence.getSingleHighlightSet().elements[0];
            var shownRange = roundDragRange || bubbleRange;
            var segmentLabel = formatter_1.formatValue(bubbleRange, timezone, time_1.DisplayYear.NEVER);
            if (colors) {
                var categoryDimension = essence.splits.get(0).getDimension(essence.dataCube.dimensions);
                var leftOffset = containerStage.x + constants_1.VIS_H_PADDING + scaleX(bubbleRange.end);
                var hoverDatums = dataset.data.map(d => d[constants_1.SPLIT].findDatumByAttribute(continuousDimension.name, bubbleRange));
                var colorValues = colors.getColors(dataset.data.map(d => d[categoryDimension.name]));
                var colorEntries = dataset.data.map((d, i) => {
                    var segment = d[categoryDimension.name];
                    var hoverDatum = hoverDatums[i];
                    if (!hoverDatum)
                        return null;
                    return {
                        color: colorValues[i],
                        segmentLabel: String(segment),
                        measureLabel: measure.formatDatum(hoverDatum)
                    };
                }).filter(Boolean);
                return React.createElement(hover_multi_bubble_1.HoverMultiBubble, {left: leftOffset, top: topOffset + HOVER_MULTI_BUBBLE_V_OFFSET, segmentLabel: segmentLabel, colorEntries: colorEntries, clicker: dragRange ? null : clicker});
            }
            else {
                var leftOffset = containerStage.x + constants_1.VIS_H_PADDING + scaleX(bubbleRange.midpoint());
                var highlightDatum = dataset.findDatumByAttribute(continuousDimension.name, shownRange);
                var segmentLabel = formatter_1.formatValue(shownRange, timezone, time_1.DisplayYear.NEVER);
                return React.createElement(segment_bubble_1.SegmentBubble, {left: leftOffset, top: topOffset + HOVER_BUBBLE_V_OFFSET, segmentLabel: segmentLabel, measureLabel: highlightDatum ? measure.formatDatum(highlightDatum) : null, clicker: dragRange ? null : clicker, openRawDataModal: openRawDataModal});
            }
        }
        else if (!dragRange && hoverRange && hoverMeasure === measure) {
            var leftOffset = containerStage.x + constants_1.VIS_H_PADDING + scaleX(hoverRange.midpoint());
            var segmentLabel = formatter_1.formatValue(hoverRange, timezone, time_1.DisplayYear.NEVER);
            if (colors) {
                var categoryDimension = essence.splits.get(0).getDimension(essence.dataCube.dimensions);
                var hoverDatums = dataset.data.map(d => d[constants_1.SPLIT].findDatumByAttribute(continuousDimension.name, hoverRange));
                var colorValues = colors.getColors(dataset.data.map(d => d[categoryDimension.name]));
                var colorEntries = dataset.data.map((d, i) => {
                    var segment = d[categoryDimension.name];
                    var hoverDatum = hoverDatums[i];
                    if (!hoverDatum)
                        return null;
                    return {
                        color: colorValues[i],
                        segmentLabel: String(segment),
                        measureLabel: measure.formatDatum(hoverDatum)
                    };
                }).filter(Boolean);
                return React.createElement(hover_multi_bubble_1.HoverMultiBubble, {left: leftOffset, top: topOffset + HOVER_MULTI_BUBBLE_V_OFFSET, segmentLabel: segmentLabel, colorEntries: colorEntries});
            }
            else {
                var hoverDatum = dataset.findDatumByAttribute(continuousDimension.name, hoverRange);
                if (!hoverDatum)
                    return null;
                var segmentLabel = formatter_1.formatValue(hoverRange, timezone, time_1.DisplayYear.NEVER);
                return React.createElement(segment_bubble_1.SegmentBubble, {left: leftOffset, top: topOffset + HOVER_BUBBLE_V_OFFSET, segmentLabel: segmentLabel, measureLabel: measure.formatDatum(hoverDatum)});
            }
        }
        return null;
    }
    renderChart(dataset, measure, chartIndex, containerStage, chartStage) {
        const { essence } = this.props;
        const { hoverRange, hoverMeasure, dragRange, scaleX, xTicks, continuousDimension } = this.state;
        const { splits, colors } = essence;
        var splitLength = splits.length();
        var lineStage = chartStage.within({ top: TEXT_SPACER, right: Y_AXIS_WIDTH, bottom: 1 }); // leave 1 for border
        var yAxisStage = chartStage.within({ top: TEXT_SPACER, left: lineStage.width, bottom: 1 });
        var measureName = measure.name;
        var getX = (d) => d[continuousDimension.name];
        var getY = (d) => d[measureName];
        var myDatum = dataset.data[0];
        var mySplitDataset = myDatum[constants_1.SPLIT];
        var extentY = null;
        if (splitLength === 1) {
            extentY = d3.extent(mySplitDataset.data, getY);
        }
        else {
            var minY = 0;
            var maxY = 0;
            mySplitDataset.data.forEach(datum => {
                var subDataset = datum[constants_1.SPLIT];
                if (subDataset) {
                    var tempExtentY = d3.extent(subDataset.data, getY);
                    minY = Math.min(tempExtentY[0], minY);
                    maxY = Math.max(tempExtentY[1], maxY);
                }
            });
            extentY = [minY, maxY];
        }
        var horizontalGridLines;
        var chartLines;
        var verticalAxis;
        var bubble;
        if (!isNaN(extentY[0]) && !isNaN(extentY[1])) {
            let scaleY = d3.scale.linear()
                .domain([Math.min(extentY[0] * 1.1, 0), Math.max(extentY[1] * 1.1, 0)])
                .range([lineStage.height, 0]);
            let yTicks = scaleY.ticks(5).filter((n) => n !== 0);
            horizontalGridLines = React.createElement(grid_lines_1.GridLines, {orientation: "horizontal", scale: scaleY, ticks: yTicks, stage: lineStage});
            verticalAxis = React.createElement(vertical_axis_1.VerticalAxis, {stage: yAxisStage, ticks: yTicks, scale: scaleY});
            if (splitLength === 1) {
                chartLines = [];
                chartLines.push(React.createElement(chart_line_1.ChartLine, {key: 'single', dataset: mySplitDataset, getX: getX, getY: getY, scaleX: scaleX, scaleY: scaleY, stage: lineStage, showArea: true, hoverRange: (!dragRange && hoverMeasure === measure) ? hoverRange : null, color: "default"}));
            }
            else {
                var colorValues = null;
                var categoryDimension = essence.splits.get(0).getDimension(essence.dataCube.dimensions);
                if (colors)
                    colorValues = colors.getColors(mySplitDataset.data.map(d => d[categoryDimension.name]));
                chartLines = mySplitDataset.data.map((datum, i) => {
                    var subDataset = datum[constants_1.SPLIT];
                    if (!subDataset)
                        return null;
                    return React.createElement(chart_line_1.ChartLine, {key: 'single' + i, dataset: subDataset, getX: getX, getY: getY, scaleX: scaleX, scaleY: scaleY, stage: lineStage, showArea: false, hoverRange: (!dragRange && hoverMeasure === measure) ? hoverRange : null, color: colorValues ? colorValues[i] : null});
                });
            }
            bubble = this.renderChartBubble(mySplitDataset, measure, chartIndex, containerStage, chartStage, extentY, scaleY);
        }
        return React.createElement("div", {className: "measure-line-chart", key: measureName, onMouseDown: this.onMouseDown.bind(this, measure), onMouseMove: this.onMouseMove.bind(this, mySplitDataset, measure, scaleX), onMouseLeave: this.onMouseLeave.bind(this, measure)}, React.createElement("svg", {style: chartStage.getWidthHeight(), viewBox: chartStage.getViewBox()}, horizontalGridLines, React.createElement(grid_lines_1.GridLines, {orientation: "vertical", scale: scaleX, ticks: xTicks, stage: lineStage}), chartLines, verticalAxis, React.createElement("line", {className: "vis-bottom", x1: "0", y1: chartStage.height - 0.5, x2: chartStage.width, y2: chartStage.height - 0.5})), React.createElement(vis_measure_label_1.VisMeasureLabel, {measure: measure, datum: myDatum}), this.renderHighlighter(), bubble);
    }
    precalculate(props, datasetLoad = null) {
        const { registerDownloadableDataset, essence, stage } = props;
        const { splits, timezone } = essence;
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
        if (splits.length()) {
            var { dataset } = datasetLoad;
            if (dataset) {
                if (registerDownloadableDataset)
                    registerDownloadableDataset(dataset);
            }
            var continuousSplit = splits.length() === 1 ? splits.get(0) : splits.get(1);
            var continuousDimension = continuousSplit.getDimension(essence.dataCube.dimensions);
            if (continuousDimension) {
                newState.continuousDimension = continuousDimension;
                var axisRange = essence.getEffectiveFilter(LineChart.id).getExtent(continuousDimension.expression);
                axisRange = axisRange ? axisRange : this.getXAxisRange(essence, continuousDimension, dataset);
                if (axisRange) {
                    newState.axisRange = axisRange;
                    let domain = [(axisRange).start, (axisRange).end];
                    let range = [0, stage.width - constants_1.VIS_H_PADDING * 2 - Y_AXIS_WIDTH];
                    let scaleFn = null;
                    if (continuousDimension.kind === 'time') {
                        scaleFn = d3.time.scale();
                    }
                    else {
                        scaleFn = d3.scale.linear();
                    }
                    newState.scaleX = scaleFn.domain(domain).range(range);
                    newState.xTicks = granularity_1.getLineChartTicks(axisRange, timezone);
                }
            }
        }
        this.setState(newState);
    }
    getXAxisRange(essence, continuousDimension, dataset) {
        if (!dataset)
            return null;
        const key = continuousDimension.name;
        if (dataset.data[0]['SPLIT']) {
            return dataset.data[0]['SPLIT'].data
                .map(d => this.getXAxisRange(essence, continuousDimension, d['SPLIT']))
                .reduce((a, b) => a ? a.union(b) : b);
        }
        else {
            let myDataset = dataset.data;
            let start = myDataset[0][key].start;
            let end = myDataset[myDataset.length - 1][key].end;
            // right now dataset might not be sorted properly
            if (start < end)
                return plywood_1.Range.fromJS({ start: start, end: end });
        }
        return null;
    }
    renderInternals() {
        var { essence, stage } = this.props;
        var { datasetLoad, axisRange, scaleX, xTicks } = this.state;
        var { splits, timezone } = essence;
        var measureCharts;
        var bottomAxis;
        if (datasetLoad.dataset && splits.length() && axisRange) {
            var measures = essence.getEffectiveMeasures().toArray();
            var chartWidth = stage.width - constants_1.VIS_H_PADDING * 2;
            var chartHeight = Math.max(MIN_CHART_HEIGHT, Math.floor(Math.min(chartWidth / MAX_ASPECT_RATIO, (stage.height - X_AXIS_HEIGHT) / measures.length)));
            var chartStage = new index_1.Stage({
                x: constants_1.VIS_H_PADDING,
                y: 0,
                width: chartWidth,
                height: chartHeight
            });
            measureCharts = measures.map((measure, chartIndex) => {
                return this.renderChart(datasetLoad.dataset, measure, chartIndex, stage, chartStage);
            });
            var xAxisStage = index_1.Stage.fromSize(chartStage.width, X_AXIS_HEIGHT);
            bottomAxis = React.createElement("svg", {className: "bottom-axis", width: xAxisStage.width, height: xAxisStage.height}, React.createElement(line_chart_axis_1.LineChartAxis, {stage: xAxisStage, ticks: xTicks, scale: scaleX, timezone: timezone}));
        }
        var measureChartsStyle = {
            maxHeight: stage.height - X_AXIS_HEIGHT
        };
        return React.createElement("div", {className: "internals line-chart-inner"}, React.createElement("div", {className: "measure-line-charts", style: measureChartsStyle, onScroll: this.onScroll.bind(this)}, measureCharts), bottomAxis);
    }
}
LineChart.id = line_chart_1.LINE_CHART_MANIFEST.name;
exports.LineChart = LineChart;
