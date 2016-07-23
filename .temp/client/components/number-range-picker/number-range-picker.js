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
require('./number-range-picker.css');
const React = require('react');
const ReactDOM = require('react-dom');
const plywood_1 = require('plywood');
const general_1 = require('../../../common/utils/general/general');
const dom_1 = require('../../utils/dom/dom');
const loader_1 = require('../loader/loader');
const query_error_1 = require('../query-error/query-error');
const range_handle_1 = require('../range-handle/range-handle');
exports.ANY_VALUE = null;
const NUB_SIZE = 16;
const GRANULARITY_IN_BAR = 300; // this is how many steps we want to represent in the slider bar
function addNubSize(value) {
    return value + NUB_SIZE;
}
function subtractNubSize(value) {
    return value && value > NUB_SIZE ? value - NUB_SIZE : 0;
}
function getNumberOfDigitsToShow(n) {
    var totalDigits = general_1.getNumberOfWholeDigits(n / GRANULARITY_IN_BAR);
    return totalDigits > 3 ? Math.min(totalDigits, 4) : 3;
}
// offset the bar a little because a rectangle at the same position as a circle will peek through
function getAdjustedStartHalf(start) {
    return start + NUB_SIZE / 2;
}
class NumberRangePicker extends React.Component {
    constructor() {
        super();
        this.state = {
            min: null,
            max: null,
            step: null,
            loading: false,
            error: null
        };
    }
    fetchData(essence, dimension, rightBound) {
        var { dataCube } = essence;
        var filterExpression = essence.getEffectiveFilter(null, dimension).toExpression();
        var $main = plywood_1.$('main');
        var query = plywood_1.ply()
            .apply('main', $main.filter(filterExpression))
            .apply('Min', $main.min(plywood_1.$(dimension.name)))
            .apply('Max', $main.max(plywood_1.$(dimension.name)));
        this.setState({
            loading: true
        });
        dataCube.executor(query)
            .then((dataset) => {
            if (!this.mounted)
                return;
            var min = dataset.data[0]['Min'];
            var max = dataset.data[0]['Max'];
            var step = max && min && isFinite(max) && isFinite(min) ? (max - min) / rightBound : 1;
            this.setState({
                min: min,
                max: max,
                loading: false,
                step: step !== 0 && isFinite(step) ? step : 1
            });
        }, (error) => {
            if (!this.mounted)
                return;
            this.setState({
                loading: false,
                error: error
            });
        });
    }
    componentDidMount() {
        this.mounted = true;
        var node = ReactDOM.findDOMNode(this.refs['number-range-picker']);
        var rect = node.getBoundingClientRect();
        var { essence, dimension } = this.props;
        var leftOffset = rect.left;
        var rightBound = rect.width;
        this.setState({ leftOffset: leftOffset, rightBound: rightBound });
        this.fetchData(essence, dimension, rightBound);
    }
    componentWillUnmount() {
        this.mounted = false;
    }
    relativePositionToValue(position, type) {
        const { step, min, max, rightBound } = this.state;
        if (position <= addNubSize(0) && type === 'start')
            return exports.ANY_VALUE;
        if (position >= rightBound && type === 'end')
            return exports.ANY_VALUE;
        var range = max - min !== 0 ? max - min : Math.abs(max);
        return general_1.toSignificantDigits(position * step, getNumberOfDigitsToShow(range));
    }
    valueToRelativePosition(value) {
        const { step } = this.state;
        return value / step;
    }
    onBarClick(positionStart, positionEnd, e) {
        const { leftOffset } = this.state;
        var clickPadding = 5;
        var absoluteX = dom_1.getXFromEvent(e);
        var relativeX = absoluteX - leftOffset;
        if (relativeX < NUB_SIZE / 2)
            return this.updateStart(leftOffset);
        var startNubPosition = addNubSize(positionStart) + clickPadding;
        var endNubPosition = subtractNubSize(positionEnd) + clickPadding;
        var isBeforeStart = relativeX < positionStart;
        var isAfterEnd = relativeX > positionEnd + NUB_SIZE;
        var inBetween = (relativeX < positionEnd) && relativeX > startNubPosition;
        if (isBeforeStart) {
            this.updateStart(absoluteX - NUB_SIZE);
        }
        else if (isAfterEnd) {
            this.updateEnd(absoluteX);
        }
        else if (inBetween) {
            var distanceFromEnd = endNubPosition - relativeX;
            var distanceFromStart = relativeX - startNubPosition;
            if (distanceFromEnd < distanceFromStart) {
                this.updateEnd(endNubPosition + leftOffset - distanceFromEnd);
            }
            else {
                this.updateStart(startNubPosition + leftOffset + distanceFromStart - NUB_SIZE);
            }
            return;
        }
    }
    updateStart(absolutePosition) {
        const { onRangeStartChange } = this.props;
        const { leftOffset } = this.state;
        var relativePosition = absolutePosition - leftOffset;
        var newValue = this.relativePositionToValue(addNubSize(relativePosition), 'start');
        onRangeStartChange(newValue);
    }
    updateEnd(absolutePosition) {
        const { onRangeEndChange } = this.props;
        const { leftOffset } = this.state;
        var relativePosition = absolutePosition - leftOffset;
        var newValue = this.relativePositionToValue(relativePosition, 'end');
        onRangeEndChange(newValue);
    }
    render() {
        const { start, end } = this.props;
        const { min, max, loading, error, step, rightBound, leftOffset } = this.state;
        var content = null;
        if (rightBound && step && isFinite(max) && isFinite(min)) {
            var relativeStart = start === exports.ANY_VALUE ? 0 : subtractNubSize(this.valueToRelativePosition(start));
            var relativeEnd = end === exports.ANY_VALUE ? rightBound : this.valueToRelativePosition(end);
            var adjustedRightBound = subtractNubSize(rightBound);
            var positionEnd = dom_1.clamp(relativeEnd, addNubSize(relativeStart), adjustedRightBound);
            var positionStart = start ? dom_1.clamp(relativeStart, 0, subtractNubSize(positionEnd)) : 0;
            var rangeBarSelected = { left: getAdjustedStartHalf(positionStart), width: positionEnd - positionStart };
            var absoluteRightBound = leftOffset + rightBound;
            content = React.createElement("div", {className: "range-slider", onMouseDown: this.onBarClick.bind(this, positionStart, positionEnd)}, React.createElement("div", {className: "range-bar full"}), React.createElement("div", {className: "range-bar selected", style: rangeBarSelected}), React.createElement(range_handle_1.RangeHandle, {positionLeft: positionStart, onChange: this.updateStart.bind(this), isAny: start === exports.ANY_VALUE, isBeyondMin: start !== exports.ANY_VALUE && start < min, leftBound: leftOffset, rightBound: leftOffset + subtractNubSize(positionEnd), offset: leftOffset}), React.createElement(range_handle_1.RangeHandle, {positionLeft: positionEnd, onChange: this.updateEnd.bind(this), isAny: end === exports.ANY_VALUE, isBeyondMax: end !== exports.ANY_VALUE && max < end, leftBound: leftOffset + addNubSize(positionStart), rightBound: absoluteRightBound, offset: leftOffset}));
        }
        return React.createElement("div", {className: "number-range-picker", ref: "number-range-picker"}, content, loading ? React.createElement(loader_1.Loader, null) : null, error ? React.createElement(query_error_1.QueryError, {error: error}) : null);
    }
}
exports.NumberRangePicker = NumberRangePicker;
