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
require('./date-range-input.css');
const React = require('react');
const chronoshift_1 = require('chronoshift');
const time_1 = require('../../../common/utils/time/time');
class DateRangeInput extends React.Component {
    constructor() {
        super();
        this.state = {
            dateString: ''
        };
    }
    // 2015-09-23T17:42:57.636Z
    // 2015-09-23 17:42
    componentDidMount() {
        var { time, timezone } = this.props;
        this.updateStateFromTime(time, timezone);
    }
    componentWillReceiveProps(nextProps) {
        var { time, timezone } = nextProps;
        this.updateStateFromTime(time, timezone);
    }
    updateStateFromTime(time, timezone) {
        if (!time)
            return;
        if (isNaN(time.valueOf())) {
            this.setState({
                dateString: ''
            });
            return;
        }
        const effectiveTime = this.props.type === "end" ? time_1.exclusiveToInclusiveEnd(time) : time;
        this.setState({
            dateString: time_1.getWallTimeString(effectiveTime, timezone)
        });
    }
    dateChange(e) {
        var dateString = e.target.value.replace(/[^\d-]/g, '').substr(0, 10);
        this.setState({
            dateString: dateString
        });
        if (dateString.length === 10) {
            this.changeDate(dateString);
        }
    }
    changeDate(possibleDateString) {
        var { timezone, onChange, type } = this.props;
        var possibleDate = new Date(possibleDateString);
        // add one if end so it passes the inclusive formatting
        var day = type === "end" ? possibleDate.getUTCDate() + 1 : possibleDate.getUTCDate();
        if (isNaN(possibleDate.valueOf())) {
            onChange(null);
        }
        else {
            // Convert from WallTime to UTC
            var possibleDate = chronoshift_1.WallTime.WallTimeToUTC(timezone.toString(), possibleDate.getUTCFullYear(), possibleDate.getUTCMonth(), day, possibleDate.getUTCHours(), possibleDate.getUTCMinutes(), possibleDate.getUTCSeconds(), possibleDate.getUTCMilliseconds());
            onChange(possibleDate);
        }
    }
    render() {
        const { hide } = this.props;
        const { dateString } = this.state;
        const value = hide ? '' : dateString;
        return React.createElement("div", {className: "date-range-input"}, React.createElement("input", {className: "input-field", value: value, onChange: this.dateChange.bind(this)}));
    }
}
exports.DateRangeInput = DateRangeInput;
