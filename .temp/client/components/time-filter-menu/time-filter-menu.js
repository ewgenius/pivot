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
require('./time-filter-menu.css');
const React = require('react');
const chronoshift_1 = require('chronoshift');
const plywood_1 = require('plywood');
const constants_1 = require('../../config/constants');
const index_1 = require('../../../common/models/index');
const time_1 = require('../../../common/utils/time/time');
const dom_1 = require('../../utils/dom/dom');
const button_1 = require('../button/button');
const button_group_1 = require('../button-group/button-group');
const date_range_picker_1 = require('../date-range-picker/date-range-picker');
var $maxTime = plywood_1.$(index_1.FilterClause.MAX_TIME_REF_NAME);
var latestPresets = [
    { name: '1H', selection: $maxTime.timeRange('PT1H', -1) },
    { name: '6H', selection: $maxTime.timeRange('PT6H', -1) },
    { name: '1D', selection: $maxTime.timeRange('P1D', -1) },
    { name: '7D', selection: $maxTime.timeRange('P1D', -7) },
    { name: '30D', selection: $maxTime.timeRange('P1D', -30) }
];
var $now = plywood_1.$(index_1.FilterClause.NOW_REF_NAME);
var currentPresets = [
    { name: 'D', selection: $now.timeBucket('P1D') },
    { name: 'W', selection: $now.timeBucket('P1W') },
    { name: 'M', selection: $now.timeBucket('P1M') },
    { name: 'Q', selection: $now.timeBucket('P3M') },
    { name: 'Y', selection: $now.timeBucket('P1Y') }
];
var previousPresets = [
    { name: 'D', selection: $now.timeFloor('P1D').timeRange('P1D', -1) },
    { name: 'W', selection: $now.timeFloor('P1W').timeRange('P1W', -1) },
    { name: 'M', selection: $now.timeFloor('P1M').timeRange('P1M', -1) },
    { name: 'Q', selection: $now.timeFloor('P3M').timeRange('P3M', -1) },
    { name: 'Y', selection: $now.timeFloor('P1Y').timeRange('P1Y', -1) }
];
class TimeFilterMenu extends React.Component {
    constructor() {
        super();
        this.state = {
            tab: null,
            timeSelection: null,
            startTime: null,
            endTime: null,
            hoverPreset: null
        };
        this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
    }
    componentWillMount() {
        const { essence, dimension } = this.props;
        const { filter } = essence;
        const { timezone } = essence;
        var dimensionExpression = dimension.expression;
        var timeSelection = filter.getSelection(dimensionExpression);
        var selectedTimeRangeSet = essence.getEffectiveFilter().getLiteralSet(dimensionExpression);
        var selectedTimeRange = (selectedTimeRangeSet && selectedTimeRangeSet.size() === 1) ? selectedTimeRangeSet.elements[0] : null;
        var clause = filter.clauseForExpression(dimensionExpression);
        this.setState({
            timeSelection: timeSelection,
            tab: (!clause || clause.relative || clause.isLessThanFullDay()) ? 'relative' : 'specific',
            startTime: selectedTimeRange ? chronoshift_1.day.floor(selectedTimeRange.start, timezone) : null,
            endTime: selectedTimeRange ? chronoshift_1.day.ceil(selectedTimeRange.end, timezone) : null
        });
    }
    componentDidMount() {
        window.addEventListener('keydown', this.globalKeyDownListener);
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this.globalKeyDownListener);
    }
    globalKeyDownListener(e) {
        if (dom_1.enterKey(e)) {
            this.onOkClick();
        }
    }
    constructFilter() {
        var { essence, dimension } = this.props;
        var { tab, startTime, endTime } = this.state;
        var { filter } = essence;
        var { timezone } = essence;
        if (tab !== 'specific')
            return null;
        if (startTime && !endTime) {
            endTime = chronoshift_1.day.shift(startTime, timezone, 1);
        }
        if (startTime && endTime && startTime < endTime) {
            return filter.setSelection(dimension.expression, plywood_1.r(plywood_1.TimeRange.fromJS({ start: startTime, end: endTime })));
        }
        else {
            return null;
        }
    }
    onPresetClick(preset) {
        var { clicker, onClose, essence, dimension } = this.props;
        var { filter } = essence;
        var newFilter = filter.setSelection(dimension.expression, preset.selection);
        clicker.changeFilter(newFilter);
        onClose();
    }
    onPresetMouseEnter(preset) {
        var { hoverPreset } = this.state;
        if (hoverPreset === preset)
            return;
        this.setState({
            hoverPreset: preset
        });
    }
    onPresetMouseLeave(preset) {
        var { hoverPreset } = this.state;
        if (hoverPreset !== preset)
            return;
        this.setState({
            hoverPreset: null
        });
    }
    onStartChange(start) {
        this.setState({
            startTime: start
        });
    }
    onEndChange(end) {
        this.setState({
            endTime: end
        });
    }
    selectTab(tab) {
        this.setState({ tab: tab });
    }
    onOkClick() {
        if (!this.actionEnabled())
            return;
        var { clicker, onClose } = this.props;
        var newFilter = this.constructFilter();
        if (!newFilter)
            return;
        clicker.changeFilter(newFilter);
        onClose();
    }
    onCancelClick() {
        var { onClose } = this.props;
        onClose();
    }
    renderPresets() {
        var { essence, dimension } = this.props;
        var { timeSelection, hoverPreset } = this.state;
        if (!dimension)
            return null;
        var { timezone } = essence;
        var presetToButton = (preset) => {
            return React.createElement("button", {key: preset.name, className: dom_1.classNames('preset', { hover: preset === hoverPreset, selected: preset.selection.equals(timeSelection) }), onClick: this.onPresetClick.bind(this, preset), onMouseEnter: this.onPresetMouseEnter.bind(this, preset), onMouseLeave: this.onPresetMouseLeave.bind(this, preset)}, preset.name);
        };
        var previewTimeRange = essence.evaluateSelection(hoverPreset ? hoverPreset.selection : timeSelection);
        var previewText = previewTimeRange ? time_1.formatTimeRange(previewTimeRange, timezone, time_1.DisplayYear.IF_DIFF) : constants_1.STRINGS.noFilter;
        var maxTimeBasedPresets = React.createElement("div", null, React.createElement("div", {className: "type"}, constants_1.STRINGS.latest), React.createElement("div", {className: "buttons"}, latestPresets.map(presetToButton)));
        return React.createElement("div", {className: "cont"}, essence.dataCube.isTimeAttribute(dimension.expression) ? maxTimeBasedPresets : null, React.createElement("div", {className: "type"}, constants_1.STRINGS.current), React.createElement("div", {className: "buttons"}, currentPresets.map(presetToButton)), React.createElement("div", {className: "type"}, constants_1.STRINGS.previous), React.createElement("div", {className: "buttons"}, previousPresets.map(presetToButton)), React.createElement("div", {className: "preview"}, previewText));
    }
    actionEnabled() {
        var { essence } = this.props;
        var { tab } = this.state;
        if (tab !== 'specific')
            return false;
        var newFilter = this.constructFilter();
        return newFilter && !essence.filter.equals(newFilter);
    }
    renderCustom() {
        var { essence, dimension } = this.props;
        var { startTime, endTime } = this.state;
        if (!dimension)
            return null;
        return React.createElement("div", null, React.createElement(date_range_picker_1.DateRangePicker, {startTime: startTime, endTime: endTime, maxTime: essence.dataCube.getMaxTimeDate(), timezone: essence.timezone, onStartChange: this.onStartChange.bind(this), onEndChange: this.onEndChange.bind(this)}), React.createElement("div", {className: "button-bar"}, React.createElement(button_1.Button, {type: "primary", onClick: this.onOkClick.bind(this), disabled: !this.actionEnabled(), title: constants_1.STRINGS.ok}), React.createElement(button_1.Button, {type: "secondary", onClick: this.onCancelClick.bind(this), title: constants_1.STRINGS.cancel})));
    }
    ;
    render() {
        var { dimension } = this.props;
        var { tab } = this.state;
        if (!dimension)
            return null;
        var tabs = ['relative', 'specific'].map((name) => {
            return {
                isSelected: tab === name,
                title: (name === 'relative' ? constants_1.STRINGS.relative : constants_1.STRINGS.specific),
                key: name,
                onClick: this.selectTab.bind(this, name)
            };
        });
        return React.createElement("div", {className: "time-filter-menu"}, React.createElement(button_group_1.ButtonGroup, {groupMembers: tabs}), tab === 'relative' ? this.renderPresets() : this.renderCustom());
    }
}
exports.TimeFilterMenu = TimeFilterMenu;
