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
require('./number-filter-menu.css');
const React = require('react');
const plywood_1 = require('plywood');
const index_1 = require('../../../common/models/index');
const constants_1 = require('../../config/constants');
const dom_1 = require('../../utils/dom/dom');
const button_1 = require('../button/button');
const number_range_picker_1 = require('../number-range-picker/number-range-picker');
function numberOrAnyToString(start) {
    if (start === number_range_picker_1.ANY_VALUE)
        return constants_1.STRINGS.any;
    return '' + start;
}
function stringToNumberOrAny(startInput) {
    var parse = parseFloat(startInput);
    return isNaN(parse) ? number_range_picker_1.ANY_VALUE : parse;
}
class NumberFilterMenu extends React.Component {
    constructor() {
        super();
        this.state = {
            leftOffset: null,
            rightBound: null,
            start: null,
            startInput: "",
            end: null,
            endInput: ""
        };
        this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
    }
    componentWillMount() {
        var { essence, dimension } = this.props;
        var valueSet = essence.filter.getLiteralSet(dimension.expression);
        var hasRange = valueSet && valueSet.elements.length !== 0;
        var start = null;
        var end = null;
        if (hasRange) {
            var range = valueSet.elements[0];
            start = range.start;
            end = range.end;
        }
        this.setState({
            startInput: numberOrAnyToString(start),
            endInput: numberOrAnyToString(end),
            start: start,
            end: end
        });
    }
    componentDidMount() {
        window.addEventListener('keydown', this.globalKeyDownListener);
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this.globalKeyDownListener);
    }
    constructFilter() {
        var { essence, dimension } = this.props;
        var { start, end } = this.state;
        var { filter } = essence;
        var validFilter = false;
        if ((start !== null && end !== null)) {
            validFilter = start <= end;
        }
        else {
            validFilter = (!isNaN(start) && !(isNaN(end))) && (start !== null || end !== null);
        }
        if (validFilter) {
            var bounds = start === end ? '[]' : '[)';
            var newSet = plywood_1.Set.fromJS({ setType: "NUMBER_RANGE", elements: [plywood_1.NumberRange.fromJS({ start: start, end: end, bounds: bounds })] });
            var clause = new index_1.FilterClause({
                expression: dimension.expression,
                selection: new plywood_1.LiteralExpression({ type: "SET/NUMBER_RANGE", value: newSet })
            });
            return filter.setClause(clause);
        }
        else {
            return null;
        }
    }
    globalKeyDownListener(e) {
        if (dom_1.enterKey(e)) {
            this.onOkClick();
        }
    }
    onOkClick() {
        if (!this.actionEnabled())
            return;
        var { clicker, onClose } = this.props;
        clicker.changeFilter(this.constructFilter());
        onClose();
    }
    onCancelClick() {
        var { onClose } = this.props;
        onClose();
    }
    onRangeInputStartChange(e) {
        var startInput = e.target.value;
        this.setState({
            startInput: startInput,
            start: stringToNumberOrAny(startInput)
        });
    }
    onRangeInputEndChange(e) {
        var endInput = e.target.value;
        this.setState({
            endInput: endInput,
            end: stringToNumberOrAny(endInput)
        });
    }
    onRangeStartChange(newStart) {
        this.setState({ startInput: numberOrAnyToString(newStart), start: newStart });
    }
    onRangeEndChange(newEnd) {
        this.setState({ endInput: numberOrAnyToString(newEnd), end: newEnd });
    }
    actionEnabled() {
        var { essence } = this.props;
        return !essence.filter.equals(this.constructFilter()) && Boolean(this.constructFilter());
    }
    render() {
        const { essence, dimension } = this.props;
        const { endInput, startInput, end, start } = this.state;
        return React.createElement("div", {className: "number-filter-menu", ref: "number-filter-menu"}, React.createElement("div", {className: "side-by-side"}, React.createElement("div", {className: "group"}, React.createElement("label", {className: "input-top-label"}, "Min"), React.createElement("input", {value: startInput, onChange: this.onRangeInputStartChange.bind(this)})), React.createElement("div", {className: "group"}, React.createElement("label", {className: "input-top-label"}, "Max"), React.createElement("input", {value: endInput, onChange: this.onRangeInputEndChange.bind(this)}))), React.createElement(number_range_picker_1.NumberRangePicker, {onRangeEndChange: this.onRangeEndChange.bind(this), onRangeStartChange: this.onRangeStartChange.bind(this), start: start, end: end, dimension: dimension, essence: essence}), React.createElement("div", {className: "button-bar"}, React.createElement(button_1.Button, {type: "primary", title: constants_1.STRINGS.ok, onClick: this.onOkClick.bind(this), disabled: !this.actionEnabled()}), React.createElement(button_1.Button, {type: "secondary", title: constants_1.STRINGS.cancel, onClick: this.onCancelClick.bind(this)})));
    }
}
exports.NumberFilterMenu = NumberFilterMenu;
