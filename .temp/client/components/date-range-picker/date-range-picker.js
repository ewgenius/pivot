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
require('./date-range-picker.css');
const React = require('react');
const chronoshift_1 = require('chronoshift');
const plywood_1 = require('plywood');
const time_1 = require('../../../common/utils/time/time');
const dom_1 = require('../../utils/dom/dom');
const constants_1 = require('../../config/constants');
const svg_icon_1 = require("../svg-icon/svg-icon");
const date_range_input_1 = require("../date-range-input/date-range-input");
class DateRangePicker extends React.Component {
    constructor() {
        super();
        this.state = {
            activeMonthStartDate: null,
            hoverTimeRange: null,
            selectionSet: false
        };
    }
    componentWillMount() {
        var { startTime, endTime, timezone } = this.props;
        if (startTime && !time_1.datesEqual(startTime, chronoshift_1.day.floor(startTime, timezone)))
            throw new Error("start time must be round");
        if (endTime && !time_1.datesEqual(endTime, chronoshift_1.day.floor(endTime, timezone)))
            throw new Error("end time must be round");
        const flooredStart = chronoshift_1.month.floor(startTime || new Date(), timezone);
        this.setState({
            activeMonthStartDate: flooredStart,
            selectionSet: true
        });
    }
    navigateToMonth(offset) {
        const { timezone } = this.props;
        const { activeMonthStartDate } = this.state;
        var newDate = chronoshift_1.month.shift(activeMonthStartDate, timezone, offset);
        this.setState({
            activeMonthStartDate: newDate
        });
    }
    goToPreviousMonth() {
        return this.navigateToMonth(-1);
    }
    goToNextMonth() {
        return this.navigateToMonth(1);
    }
    calculateHoverTimeRange(mouseEnteredDay) {
        const { startTime, endTime } = this.props;
        var hoverTimeRange = null;
        if (startTime && !endTime) {
            var start = startTime;
            var end = mouseEnteredDay;
            // if mousing over backwards, set end to old start time
            if (mouseEnteredDay < startTime) {
                start = mouseEnteredDay;
                end = startTime;
            }
            hoverTimeRange = new plywood_1.TimeRange({ start: start, end: end, bounds: '[]' });
        }
        this.setState({ hoverTimeRange: hoverTimeRange });
    }
    onCalendarMouseLeave() {
        this.setState({ hoverTimeRange: null });
    }
    selectNewRange(startDate, endDate) {
        const { onStartChange, onEndChange, timezone } = this.props;
        onStartChange(startDate);
        // real end points are exclusive so +1 full day to selection (which is floored) to get the real end point
        if (endDate)
            endDate = time_1.shiftOneDay(endDate, timezone);
        onEndChange(endDate);
    }
    selectDay(selection) {
        const { startTime } = this.props;
        const { selectionSet } = this.state;
        if (selectionSet) {
            this.setState({ hoverTimeRange: null, selectionSet: false });
            this.selectNewRange(selection, null);
        }
        else {
            const isDoubleClickSameDay = time_1.datesEqual(selection, startTime);
            const isBackwardSelection = selection < startTime;
            if (isDoubleClickSameDay) {
                this.selectNewRange(startTime, startTime);
            }
            else if (isBackwardSelection) {
                this.selectNewRange(selection, startTime);
            }
            else {
                this.selectNewRange(startTime, selection);
            }
            this.setState({ selectionSet: true });
        }
    }
    getIsSelectable(date) {
        const { hoverTimeRange, selectionSet } = this.state;
        var inHoverTimeRange = false;
        if (hoverTimeRange) {
            inHoverTimeRange = hoverTimeRange.contains(date);
        }
        return inHoverTimeRange && !selectionSet;
    }
    getIsSelectedEdgeEnd(isSingleDate, candidate) {
        if (isSingleDate)
            return false;
        const { startTime, endTime, timezone } = this.props;
        const candidateEndPoint = time_1.shiftOneDay(candidate, timezone);
        return time_1.wallTimeInclusiveEndEqual(endTime, candidateEndPoint, timezone) && endTime > startTime;
    }
    renderDays(weeks, monthStart, isSingleDate) {
        const { startTime, endTime, maxTime, timezone } = this.props;
        const nextMonthStart = chronoshift_1.month.shift(monthStart, timezone, 1);
        return weeks.map((daysInWeek, row) => {
            return React.createElement("div", {className: "week", key: row}, " ", daysInWeek.map((dayDate, column) => {
                var isPast = dayDate < monthStart;
                var isFuture = dayDate >= nextMonthStart;
                var isBeyondMaxRange = dayDate > maxTime;
                var isSelectedEdgeStart = time_1.datesEqual(dayDate, startTime);
                var isSelectedEdgeEnd = this.getIsSelectedEdgeEnd(isSingleDate, dayDate);
                var className = dom_1.classNames("day", "value", {
                    past: isPast,
                    future: isFuture,
                    "beyond-max-range": isBeyondMaxRange,
                    "selectable": this.getIsSelectable(dayDate),
                    "selected": startTime < dayDate && dayDate < endTime,
                    "selected-edge": isSelectedEdgeStart || isSelectedEdgeEnd
                });
                return React.createElement("div", {className: className, key: column, onClick: this.selectDay.bind(this, dayDate), onMouseEnter: this.calculateHoverTimeRange.bind(this, dayDate)}, time_1.getWallTimeDay(dayDate, timezone));
            }));
        });
    }
    ;
    renderCalendar(startDate, isSingleDate) {
        const { timezone } = this.props;
        var weeks = time_1.monthToWeeks(startDate, timezone, constants_1.getLocale());
        const firstWeek = weeks[0];
        const lastWeek = weeks[weeks.length - 1];
        const countPrepend = 7 - firstWeek.length;
        const countAppend = 7 - lastWeek.length;
        weeks[0] = time_1.prependDays(timezone, firstWeek, countPrepend);
        weeks[weeks.length - 1] = time_1.appendDays(timezone, lastWeek, countAppend);
        return this.renderDays(weeks, startDate, isSingleDate);
    }
    renderCalendarNav(startDate) {
        const { timezone } = this.props;
        return React.createElement("div", {className: "calendar-nav"}, React.createElement("div", {className: 'caret left', onClick: this.goToPreviousMonth.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/full-caret-left.svg')})), time_1.getWallTimeMonthWithYear(startDate, timezone), React.createElement("div", {className: 'caret right', onClick: this.goToNextMonth.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/full-caret-right.svg')})));
    }
    render() {
        const { startTime, endTime, timezone, onStartChange, onEndChange } = this.props;
        const { activeMonthStartDate, selectionSet } = this.state;
        if (!activeMonthStartDate)
            return null;
        var isSingleDate = endTime ? time_1.getWallTimeDay(startTime, timezone) === time_1.getEndWallTimeInclusive(endTime, timezone).getDate() : true;
        return React.createElement("div", {className: "date-range-picker"}, React.createElement("div", {className: "side-by-side"}, React.createElement(date_range_input_1.DateRangeInput, {type: "start", time: startTime, timezone: timezone, onChange: onStartChange.bind(this)}), React.createElement(date_range_input_1.DateRangeInput, {type: "end", time: endTime, timezone: timezone, onChange: onEndChange.bind(this), hide: !selectionSet})), React.createElement("div", {className: "calendar", onMouseLeave: this.onCalendarMouseLeave.bind(this)}, this.renderCalendarNav(activeMonthStartDate), React.createElement("div", {className: "week"}, constants_1.getLocale().shortDays.map((day, i) => {
            return React.createElement("div", {className: "day label", key: day + i}, React.createElement("span", {className: "space"}), day);
        })), this.renderCalendar(activeMonthStartDate, isSingleDate)));
    }
}
exports.DateRangePicker = DateRangePicker;
