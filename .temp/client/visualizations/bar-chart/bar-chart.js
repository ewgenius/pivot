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
require('./bar-chart.css');
const React = require('react');
const immutable_1 = require('immutable');
const plywood_1 = require('plywood');
const index_1 = require('../../../common/models/index');
const bar_chart_1 = require('../../../common/manifests/bar-chart/bar-chart');
const formatter_1 = require('../../../common/utils/formatter/formatter');
const time_1 = require('../../../common/utils/time/time');
const constants_1 = require('../../config/constants');
const dom_1 = require('../../utils/dom/dom');
const vis_measure_label_1 = require('../../components/vis-measure-label/vis-measure-label');
const vertical_axis_1 = require('../../components/vertical-axis/vertical-axis');
const bucket_marks_1 = require('../../components/bucket-marks/bucket-marks');
const grid_lines_1 = require('../../components/grid-lines/grid-lines');
const segment_bubble_1 = require('../../components/segment-bubble/segment-bubble');
const scroller_1 = require('../../components/scroller/scroller');
const base_visualization_1 = require('../base-visualization/base-visualization');
const bar_coordinates_1 = require('./bar-coordinates');
const X_AXIS_HEIGHT = 84;
const Y_AXIS_WIDTH = 60;
const CHART_TOP_PADDING = 10;
const CHART_BOTTOM_PADDING = 0;
const MIN_CHART_HEIGHT = 200;
const MAX_STEP_WIDTH = 140; // Note that the step is bar + empty space around it. The width of the rectangle is step * BAR_PROPORTION
const MIN_STEP_WIDTH = 20;
const BAR_PROPORTION = 0.8;
const BARS_MIN_PAD_LEFT = 30;
const BARS_MIN_PAD_RIGHT = 6;
const HOVER_BUBBLE_V_OFFSET = 8;
const SELECTION_PAD = 4;
function getFilterFromDatum(splits, dataPath, dataCube) {
    return new index_1.Filter(immutable_1.List(dataPath.map((datum, i) => {
        var split = splits.get(i);
        var segment = datum[split.getDimension(dataCube.dimensions).name];
        return new index_1.FilterClause({
            expression: split.expression,
            selection: plywood_1.r(plywood_1.TimeRange.isTimeRange(segment) ? segment : plywood_1.Set.fromJS([segment]))
        });
    })));
}
class BarChart extends base_visualization_1.BaseVisualization {
    constructor() {
        super();
        this.coordinatesCache = [];
    }
    getDefaultState() {
        var s = super.getDefaultState();
        s.hoverInfo = null;
        return s;
    }
    componentWillReceiveProps(nextProps) {
        this.precalculate(nextProps);
        var { essence } = this.props;
        var nextEssence = nextProps.essence;
        if (nextEssence.differentDataCube(essence) ||
            nextEssence.differentEffectiveFilter(essence, BarChart.id) ||
            nextEssence.differentEffectiveSplits(essence) ||
            nextEssence.newEffectiveMeasures(essence)) {
            this.fetchData(nextEssence);
        }
    }
    calculateMousePosition(x, y) {
        var { essence } = this.props;
        var measures = essence.getEffectiveMeasures().toArray();
        var chartStage = this.getSingleChartStage();
        var chartHeight = this.getOuterChartHeight(chartStage);
        if (y >= chartHeight * measures.length)
            return; // on x axis
        if (x >= chartStage.width)
            return; // on y axis
        const xScale = this.getPrimaryXScale();
        var chartIndex = Math.floor(y / chartHeight);
        var chartCoordinates = this.getBarsCoordinates(chartIndex, xScale);
        var { path, coordinates } = this.findBarCoordinatesForX(x, chartCoordinates, []);
        return {
            path: this.findPathForIndices(path),
            measure: measures[chartIndex],
            chartIndex: chartIndex,
            coordinates: coordinates
        };
    }
    findPathForIndices(indices) {
        var { datasetLoad } = this.state;
        var mySplitDataset = datasetLoad.dataset.data[0][constants_1.SPLIT];
        var path = [];
        var currentData = mySplitDataset;
        indices.forEach((i) => {
            let datum = currentData.data[i];
            path.push(datum);
            currentData = datum[constants_1.SPLIT];
        });
        return path;
    }
    findBarCoordinatesForX(x, coordinates, currentPath) {
        for (let i = 0; i < coordinates.length; i++) {
            if (coordinates[i].isXWithin(x)) {
                currentPath.push(i);
                if (coordinates[i].hasChildren()) {
                    return this.findBarCoordinatesForX(x, coordinates[i].children, currentPath);
                }
                else {
                    return { path: currentPath, coordinates: coordinates[i] };
                }
            }
        }
        return { path: [], coordinates: null };
    }
    onSimpleScroll(scrollTop, scrollLeft) {
        this.setState({
            hoverInfo: null,
            scrollLeft: scrollLeft,
            scrollTop: scrollTop
        });
    }
    onMouseMove(x, y) {
        this.setState({ hoverInfo: this.calculateMousePosition(x, y) });
    }
    onMouseLeave() {
        this.setState({ hoverInfo: null });
    }
    onClick(x, y) {
        const selectionInfo = this.calculateMousePosition(x, y);
        if (!selectionInfo)
            return;
        const { essence, clicker } = this.props;
        if (!selectionInfo.coordinates) {
            clicker.dropHighlight();
            this.setState({ selectionInfo: null });
            return;
        }
        const { path, chartIndex } = selectionInfo;
        const { splits, dataCube } = essence;
        var measures = essence.getEffectiveMeasures().toArray();
        var rowHighlight = getFilterFromDatum(splits, path, dataCube);
        if (essence.highlightOn(BarChart.id, measures[chartIndex].name)) {
            if (rowHighlight.equals(essence.highlight.delta)) {
                clicker.dropHighlight();
                this.setState({ selectionInfo: null });
                return;
            }
        }
        this.setState({ selectionInfo: selectionInfo });
        clicker.changeHighlight(BarChart.id, measures[chartIndex].name, rowHighlight);
    }
    getYExtent(data, measure) {
        var measureName = measure.name;
        var getY = (d) => d[measureName];
        return d3.extent(data, getY);
    }
    getYScale(measure, yAxisStage) {
        var { essence } = this.props;
        var { flatData } = this.state;
        var splitLength = essence.splits.length();
        var leafData = flatData.filter((d) => d['__nest'] === splitLength - 1);
        var extentY = this.getYExtent(leafData, measure);
        return d3.scale.linear()
            .domain([Math.min(extentY[0] * 1.1, 0), Math.max(extentY[1] * 1.1, 0)])
            .range([yAxisStage.height, yAxisStage.y]);
    }
    hasValidYExtent(measure, data) {
        let [yMin, yMax] = this.getYExtent(data, measure);
        return !isNaN(yMin) && !isNaN(yMax);
    }
    getSingleChartStage() {
        const xScale = this.getPrimaryXScale();
        const { essence, stage } = this.props;
        const { stepWidth } = this.getBarDimensions(xScale.rangeBand());
        const xTicks = xScale.domain();
        const width = xTicks.length > 0 ? dom_1.roundToPx(xScale(xTicks[xTicks.length - 1])) + stepWidth : 0;
        const measures = essence.getEffectiveMeasures();
        const availableHeight = stage.height - X_AXIS_HEIGHT;
        const height = Math.max(MIN_CHART_HEIGHT, Math.floor(availableHeight / measures.size));
        return new index_1.Stage({
            x: 0,
            y: CHART_TOP_PADDING,
            width: Math.max(width, stage.width - Y_AXIS_WIDTH - constants_1.VIS_H_PADDING * 2),
            height: height - CHART_TOP_PADDING - CHART_BOTTOM_PADDING
        });
    }
    getOuterChartHeight(chartStage) {
        return chartStage.height + CHART_TOP_PADDING + CHART_BOTTOM_PADDING;
    }
    getAxisStages(chartStage) {
        const { essence, stage } = this.props;
        const xHeight = Math.max(stage.height - (CHART_TOP_PADDING + CHART_BOTTOM_PADDING + chartStage.height) * essence.getEffectiveMeasures().size, X_AXIS_HEIGHT);
        return {
            xAxisStage: new index_1.Stage({ x: chartStage.x, y: 0, height: xHeight, width: chartStage.width }),
            yAxisStage: new index_1.Stage({ x: 0, y: chartStage.y, height: chartStage.height, width: Y_AXIS_WIDTH + constants_1.VIS_H_PADDING })
        };
    }
    getScrollerLayout(chartStage, xAxisStage, yAxisStage) {
        var { essence } = this.props;
        var measures = essence.getEffectiveMeasures().toArray();
        const oneChartHeight = this.getOuterChartHeight(chartStage);
        return {
            // Inner dimensions
            bodyWidth: chartStage.width,
            bodyHeight: oneChartHeight * measures.length - CHART_BOTTOM_PADDING,
            // Gutters
            top: 0,
            right: yAxisStage.width,
            bottom: xAxisStage.height,
            left: 0
        };
    }
    getBubbleTopOffset(y, chartIndex, chartStage) {
        const { scrollTop } = this.state;
        const oneChartHeight = this.getOuterChartHeight(chartStage);
        const chartsAboveMe = oneChartHeight * chartIndex;
        return chartsAboveMe - scrollTop + y - HOVER_BUBBLE_V_OFFSET + CHART_TOP_PADDING;
    }
    getBubbleLeftOffset(x) {
        const { stage } = this.props;
        const { scrollLeft } = this.state;
        return stage.x + constants_1.VIS_H_PADDING + x - scrollLeft;
    }
    canShowBubble(leftOffset, topOffset) {
        const { stage } = this.props;
        if (topOffset <= 0)
            return false;
        if (topOffset > stage.height - X_AXIS_HEIGHT)
            return false;
        if (leftOffset - stage.x <= 0)
            return false;
        if (leftOffset > stage.x + stage.width - Y_AXIS_WIDTH - constants_1.VIS_H_PADDING)
            return false;
        return true;
    }
    renderSelectionBubble(hoverInfo) {
        const { essence, stage, clicker, openRawDataModal } = this.props;
        const { measure, path, chartIndex, segmentLabel, coordinates } = hoverInfo;
        const chartStage = this.getSingleChartStage();
        const { splits, dataCube } = essence;
        const dimension = splits.get(hoverInfo.splitIndex).getDimension(dataCube.dimensions);
        const leftOffset = this.getBubbleLeftOffset(coordinates.middleX);
        const topOffset = this.getBubbleTopOffset(coordinates.y, chartIndex, chartStage);
        if (!this.canShowBubble(leftOffset, topOffset))
            return null;
        return React.createElement(segment_bubble_1.SegmentBubble, {left: leftOffset, top: stage.y + topOffset, dimension: dimension, segmentLabel: segmentLabel, measureLabel: measure.formatDatum(path[path.length - 1]), clicker: clicker, openRawDataModal: openRawDataModal, onClose: this.onBubbleClose.bind(this)});
    }
    onBubbleClose() {
        this.setState({ selectionInfo: null });
    }
    renderHoverBubble(hoverInfo) {
        const { stage } = this.props;
        const chartStage = this.getSingleChartStage();
        const { measure, path, chartIndex, segmentLabel, coordinates } = hoverInfo;
        const leftOffset = this.getBubbleLeftOffset(coordinates.middleX);
        const topOffset = this.getBubbleTopOffset(coordinates.y, chartIndex, chartStage);
        if (!this.canShowBubble(leftOffset, topOffset))
            return null;
        return React.createElement(segment_bubble_1.SegmentBubble, {top: stage.y + topOffset, left: leftOffset, segmentLabel: segmentLabel, measureLabel: measure.formatDatum(path[path.length - 1])});
    }
    isSelected(path, measure) {
        const { essence } = this.props;
        const { splits, dataCube } = essence;
        if (essence.highlightOnDifferentMeasure(BarChart.id, measure.name))
            return false;
        if (essence.highlightOn(BarChart.id, measure.name)) {
            return essence.highlight.delta.equals(getFilterFromDatum(splits, path, dataCube));
        }
        return false;
    }
    isFaded() {
        const { essence } = this.props;
        return essence.highlightOn(BarChart.id);
    }
    hasAnySelectionGoingOn() {
        return this.props.essence.highlightOn(BarChart.id);
    }
    isHovered(path, measure) {
        const { essence } = this.props;
        const { hoverInfo } = this.state;
        const { splits, dataCube } = essence;
        if (this.hasAnySelectionGoingOn())
            return false;
        if (!hoverInfo)
            return false;
        if (hoverInfo.measure !== measure)
            return false;
        const filter = (p) => getFilterFromDatum(splits, p, dataCube);
        return filter(hoverInfo.path).equals(filter(path));
    }
    renderBars(data, measure, chartIndex, chartStage, xAxisStage, coordinates, splitIndex = 0, path = []) {
        const { essence } = this.props;
        const { timezone } = essence;
        var bars = [];
        var highlight;
        const dimension = essence.splits.get(splitIndex).getDimension(essence.dataCube.dimensions);
        const splitLength = essence.splits.length();
        data.forEach((d, i) => {
            let segmentValue = d[dimension.name];
            let segmentValueStr = formatter_1.formatValue(segmentValue, timezone, time_1.DisplayYear.NEVER);
            let subPath = path.concat(d);
            let bar;
            let bubble = null;
            let subCoordinates = coordinates[i];
            let { x, y, height, barWidth, barOffset } = coordinates[i];
            if (splitIndex < splitLength - 1) {
                let subData = d[constants_1.SPLIT].data;
                let subRender = this.renderBars(subData, measure, chartIndex, chartStage, xAxisStage, subCoordinates.children, splitIndex + 1, subPath);
                bar = subRender.bars;
                if (!highlight && subRender.highlight)
                    highlight = subRender.highlight;
            }
            else {
                let bubbleInfo = {
                    measure: measure,
                    chartIndex: chartIndex,
                    path: subPath,
                    coordinates: subCoordinates,
                    segmentLabel: segmentValueStr,
                    splitIndex: splitIndex
                };
                let isHovered = this.isHovered(subPath, measure);
                if (isHovered) {
                    bubble = this.renderHoverBubble(bubbleInfo);
                }
                let selected = this.isSelected(subPath, measure);
                let faded = this.isFaded();
                if (selected) {
                    bubble = this.renderSelectionBubble(bubbleInfo);
                    if (bubble)
                        highlight = this.renderSelectionHighlight(chartStage, subCoordinates, chartIndex);
                }
                bar = React.createElement("g", {className: dom_1.classNames('bar', { selected: selected, 'not-selected': (!selected && faded), isHovered: isHovered }), key: String(segmentValue), transform: `translate(${dom_1.roundToPx(x)}, 0)`}, React.createElement("rect", {className: "background", width: dom_1.roundToPx(barWidth), height: dom_1.roundToPx(Math.abs(height)), x: barOffset, y: dom_1.roundToPx(y)}), bubble);
            }
            bars.push(bar);
        });
        return { bars: bars, highlight: highlight };
    }
    renderSelectionHighlight(chartStage, coordinates, chartIndex) {
        const { scrollLeft, scrollTop } = this.state;
        const chartHeight = this.getOuterChartHeight(chartStage);
        const { barWidth, height, barOffset, y, x } = coordinates;
        const leftOffset = dom_1.roundToPx(x) + barOffset - SELECTION_PAD + chartStage.x - scrollLeft;
        const topOffset = dom_1.roundToPx(y) - SELECTION_PAD + chartStage.y - scrollTop + chartHeight * chartIndex;
        var style = {
            left: leftOffset,
            top: topOffset,
            width: dom_1.roundToPx(barWidth + SELECTION_PAD * 2),
            height: dom_1.roundToPx(Math.abs(height) + SELECTION_PAD * 2)
        };
        return React.createElement("div", {className: "selection-highlight", style: style});
    }
    renderXAxis(data, coordinates, xAxisStage) {
        const { essence } = this.props;
        const xScale = this.getPrimaryXScale();
        const xTicks = xScale.domain();
        const split = essence.splits.get(0);
        const dimension = split.getDimension(essence.dataCube.dimensions);
        var labels = [];
        if (dimension.isContinuous()) {
            var lastIndex = data.length - 1;
            var ascending = split.sortAction.direction === plywood_1.SortAction.ASCENDING;
            var leftThing = ascending ? 'start' : 'end';
            var rightThing = ascending ? 'end' : 'start';
            data.forEach((d, i) => {
                let segmentValue = d[dimension.name];
                let segmentValueStr = String(plywood_1.Range.isRange(segmentValue) ? segmentValue[leftThing] : '');
                let coordinate = coordinates[i];
                labels.push(React.createElement("div", {className: "slanty-label continuous", key: i, style: { right: xAxisStage.width - coordinate.x }}, segmentValueStr));
                if (i === lastIndex) {
                    segmentValueStr = String(plywood_1.Range.isRange(segmentValue) ? segmentValue[rightThing] : '');
                    labels.push(React.createElement("div", {className: "slanty-label continuous", key: "last-one", style: { right: xAxisStage.width - (coordinate.x + coordinate.stepWidth) }}, segmentValueStr));
                }
            });
        }
        else {
            data.forEach((d, i) => {
                let segmentValueStr = String(d[dimension.name]);
                let coordinate = coordinates[i];
                labels.push(React.createElement("div", {className: "slanty-label categorical", key: segmentValueStr, style: { right: xAxisStage.width - (coordinate.x + coordinate.stepWidth / 2) }}, segmentValueStr));
            });
        }
        return React.createElement("div", {className: "x-axis", style: { width: xAxisStage.width }}, React.createElement("svg", {style: xAxisStage.getWidthHeight(), viewBox: xAxisStage.getViewBox()}, React.createElement(bucket_marks_1.BucketMarks, {stage: xAxisStage, ticks: xTicks, scale: xScale})), labels);
    }
    getYAxisStuff(dataset, measure, chartStage, chartIndex) {
        var { yAxisStage } = this.getAxisStages(chartStage);
        var yScale = this.getYScale(measure, yAxisStage);
        var yTicks = yScale.ticks(5);
        var yGridLines = React.createElement(grid_lines_1.GridLines, {orientation: "horizontal", scale: yScale, ticks: yTicks, stage: chartStage});
        var axisStage = yAxisStage.changeY(yAxisStage.y + (chartStage.height + CHART_TOP_PADDING + CHART_BOTTOM_PADDING) * chartIndex);
        var yAxis = React.createElement(vertical_axis_1.VerticalAxis, {key: measure.name, stage: axisStage, ticks: yTicks, scale: yScale, hideZero: true});
        return { yGridLines: yGridLines, yAxis: yAxis, yScale: yScale };
    }
    isChartVisible(chartIndex, xAxisStage) {
        const { stage } = this.props;
        const { scrollTop } = this.state;
        const chartStage = this.getSingleChartStage();
        const chartHeight = this.getOuterChartHeight(chartStage);
        const topY = chartIndex * chartHeight;
        const viewPortHeight = stage.height - xAxisStage.height;
        const hiddenAtBottom = topY - scrollTop >= viewPortHeight;
        const bottomY = topY + chartHeight;
        const hiddenAtTop = bottomY < scrollTop;
        return !hiddenAtTop && !hiddenAtBottom;
    }
    renderChart(dataset, coordinates, measure, chartIndex, chartStage, getX) {
        var mySplitDataset = dataset.data[0][constants_1.SPLIT];
        // Invalid data, early return
        if (!this.hasValidYExtent(measure, mySplitDataset.data)) {
            return {
                chart: React.createElement("div", {className: "measure-bar-chart", key: measure.name, style: { width: chartStage.width }}, React.createElement("svg", {style: chartStage.getWidthHeight(0, CHART_BOTTOM_PADDING), viewBox: chartStage.getViewBox(0, CHART_BOTTOM_PADDING)}), React.createElement(vis_measure_label_1.VisMeasureLabel, {measure: measure, datum: dataset.data[0]})),
                yAxis: null,
                highlight: null
            };
        }
        let { xAxisStage } = this.getAxisStages(chartStage);
        var { yAxis, yGridLines } = this.getYAxisStuff(mySplitDataset, measure, chartStage, chartIndex);
        var bars;
        var highlight;
        if (this.isChartVisible(chartIndex, xAxisStage)) {
            let renderedChart = this.renderBars(mySplitDataset.data, measure, chartIndex, chartStage, xAxisStage, coordinates);
            bars = renderedChart.bars;
            highlight = renderedChart.highlight;
        }
        var chart = React.createElement("div", {className: "measure-bar-chart", key: measure.name, style: { width: chartStage.width }}, React.createElement("svg", {style: chartStage.getWidthHeight(0, CHART_BOTTOM_PADDING), viewBox: chartStage.getViewBox(0, CHART_BOTTOM_PADDING)}, yGridLines, React.createElement("g", {className: "bars", transform: chartStage.getTransform()}, bars)), React.createElement(vis_measure_label_1.VisMeasureLabel, {measure: measure, datum: dataset.data[0]}));
        return { chart: chart, yAxis: yAxis, highlight: highlight };
    }
    precalculate(props, datasetLoad = null) {
        const { registerDownloadableDataset, essence, stage } = props;
        const { splits } = essence;
        this.coordinatesCache = [];
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
            let firstSplitDataSet = dataset.data[0][constants_1.SPLIT];
            if (registerDownloadableDataset)
                registerDownloadableDataset(dataset);
            let flatData = firstSplitDataSet.flatten({
                order: 'preorder',
                nestingName: '__nest',
                parentName: '__parent'
            });
            var maxima = splits.toArray().map(() => 0); // initializing maxima to 0
            this.maxNumberOfLeaves(firstSplitDataSet.data, maxima, 0);
            newState.maxNumberOfLeaves = maxima;
            newState.flatData = flatData;
        }
        this.setState(newState);
    }
    maxNumberOfLeaves(data, maxima, level) {
        maxima[level] = Math.max(maxima[level], data.length);
        if (data[0] && data[0][constants_1.SPLIT] !== undefined) {
            let n = data.length;
            for (let i = 0; i < n; i++) {
                this.maxNumberOfLeaves(data[i][constants_1.SPLIT].data, maxima, level + 1);
            }
        }
    }
    getPrimaryXScale() {
        const { datasetLoad, maxNumberOfLeaves } = this.state;
        var data = datasetLoad.dataset.data[0][constants_1.SPLIT].data;
        const { essence } = this.props;
        const { splits, dataCube } = essence;
        const dimension = splits.get(0).getDimension(dataCube.dimensions);
        var getX = (d) => d[dimension.name];
        const { usedWidth, padLeft } = this.getXValues(maxNumberOfLeaves);
        return d3.scale.ordinal()
            .domain(data.map(getX))
            .rangeBands([padLeft, padLeft + usedWidth]);
    }
    getBarDimensions(xRangeBand) {
        if (isNaN(xRangeBand))
            xRangeBand = 0;
        var stepWidth = xRangeBand;
        var barWidth = Math.max(stepWidth * BAR_PROPORTION, 0);
        var barOffset = (stepWidth - barWidth) / 2;
        return { stepWidth: stepWidth, barWidth: barWidth, barOffset: barOffset };
    }
    getXValues(maxNumberOfLeaves) {
        const { essence, stage } = this.props;
        var overallWidth = stage.width - constants_1.VIS_H_PADDING * 2 - Y_AXIS_WIDTH;
        var numPrimarySteps = maxNumberOfLeaves[0];
        var minStepWidth = MIN_STEP_WIDTH * maxNumberOfLeaves.slice(1).reduce(((a, b) => a * b), 1);
        var maxAvailableWidth = overallWidth - BARS_MIN_PAD_LEFT - BARS_MIN_PAD_RIGHT;
        var stepWidth;
        if (minStepWidth * numPrimarySteps < maxAvailableWidth) {
            stepWidth = Math.max(Math.min(maxAvailableWidth / numPrimarySteps, MAX_STEP_WIDTH * essence.splits.length()), MIN_STEP_WIDTH);
        }
        else {
            stepWidth = minStepWidth;
        }
        var usedWidth = stepWidth * maxNumberOfLeaves[0];
        var padLeft = Math.max(BARS_MIN_PAD_LEFT, (overallWidth - usedWidth) / 2);
        return { padLeft: padLeft, usedWidth: usedWidth };
    }
    getBarsCoordinates(chartIndex, xScale) {
        if (!!this.coordinatesCache[chartIndex]) {
            return this.coordinatesCache[chartIndex];
        }
        const { essence } = this.props;
        const { datasetLoad } = this.state;
        const { splits, dataCube } = essence;
        const measure = essence.getEffectiveMeasures().toArray()[chartIndex];
        const dataset = datasetLoad.dataset.data[0][constants_1.SPLIT];
        const dimension = splits.get(0).getDimension(dataCube.dimensions);
        var chartStage = this.getSingleChartStage();
        var { yScale } = this.getYAxisStuff(dataset, measure, chartStage, chartIndex);
        this.coordinatesCache[chartIndex] = this.getSubCoordinates(dataset.data, measure, chartStage, (d) => d[dimension.name], xScale, yScale);
        return this.coordinatesCache[chartIndex];
    }
    getSubCoordinates(data, measure, chartStage, getX, xScale, scaleY, splitIndex = 1) {
        const { essence } = this.props;
        const { maxNumberOfLeaves } = this.state;
        var { stepWidth, barWidth, barOffset } = this.getBarDimensions(xScale.rangeBand());
        var coordinates = data.map((d, i) => {
            let x = xScale(getX(d, i));
            let y = scaleY(d[measure.name]);
            let h = scaleY(0) - y;
            var children = [];
            var coordinate = new bar_coordinates_1.BarCoordinates({
                x: x,
                y: h >= 0 ? y : scaleY(0),
                width: dom_1.roundToPx(barWidth),
                height: dom_1.roundToPx(Math.abs(h)),
                stepWidth: stepWidth,
                barWidth: barWidth,
                barOffset: barOffset,
                children: children
            });
            if (splitIndex < essence.splits.length()) {
                let subStage = new index_1.Stage({ x: x, y: chartStage.y, width: barWidth, height: chartStage.height });
                let subGetX = (d, i) => String(i);
                let subData = d[constants_1.SPLIT].data;
                let subxScale = d3.scale.ordinal()
                    .domain(d3.range(0, maxNumberOfLeaves[splitIndex]).map(String))
                    .rangeBands([x + barOffset, x + subStage.width]);
                coordinate.children = this.getSubCoordinates(subData, measure, subStage, subGetX, subxScale, scaleY, splitIndex + 1);
            }
            return coordinate;
        });
        return coordinates;
    }
    renderRightGutter(measures, yAxisStage, yAxes) {
        var yAxesStage = yAxisStage.changeHeight((yAxisStage.height + CHART_TOP_PADDING + CHART_BOTTOM_PADDING) * measures.length);
        return React.createElement("svg", {style: yAxesStage.getWidthHeight(), viewBox: yAxesStage.getViewBox()}, yAxes);
    }
    renderSelectionContainer(selectionHighlight, chartIndex, chartStage) {
        const { scrollLeft, scrollTop } = this.state;
        const chartHeight = this.getOuterChartHeight(chartStage);
        return React.createElement("div", {className: "selection-highlight-container"}, selectionHighlight);
    }
    renderInternals() {
        const { essence, stage } = this.props;
        const { datasetLoad } = this.state;
        const { splits, dataCube } = essence;
        const dimension = splits.get(0).getDimension(dataCube.dimensions);
        var scrollerLayout;
        var measureCharts = [];
        var xAxis;
        var rightGutter;
        var overlay;
        if (datasetLoad.dataset && splits.length()) {
            let xScale = this.getPrimaryXScale();
            let yAxes = [];
            let highlights = [];
            let measures = essence.getEffectiveMeasures().toArray();
            let getX = (d) => d[dimension.name];
            let chartStage = this.getSingleChartStage();
            let { xAxisStage, yAxisStage } = this.getAxisStages(chartStage);
            xAxis = this.renderXAxis(datasetLoad.dataset.data[0][constants_1.SPLIT].data, this.getBarsCoordinates(0, xScale), xAxisStage);
            measures.forEach((measure, chartIndex) => {
                let coordinates = this.getBarsCoordinates(chartIndex, xScale);
                let { yAxis, chart, highlight } = this.renderChart(datasetLoad.dataset, coordinates, measure, chartIndex, chartStage, getX);
                measureCharts.push(chart);
                yAxes.push(yAxis);
                if (highlight) {
                    overlay = this.renderSelectionContainer(highlight, chartIndex, chartStage);
                }
            });
            scrollerLayout = this.getScrollerLayout(chartStage, xAxisStage, yAxisStage);
            rightGutter = this.renderRightGutter(measures, chartStage, yAxes);
        }
        return React.createElement("div", {className: "internals measure-bar-charts", style: { maxHeight: stage.height }}, React.createElement(scroller_1.Scroller, {layout: scrollerLayout, bottomGutter: xAxis, rightGutter: rightGutter, body: measureCharts, overlay: overlay, onClick: this.onClick.bind(this), onMouseMove: this.onMouseMove.bind(this), onMouseLeave: this.onMouseLeave.bind(this), onScroll: this.onSimpleScroll.bind(this)}));
    }
}
BarChart.id = bar_chart_1.BAR_CHART_MANIFEST.name;
exports.BarChart = BarChart;
