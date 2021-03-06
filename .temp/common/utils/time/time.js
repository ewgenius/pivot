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
const d3 = require('d3');
const chronoshift_1 = require('chronoshift');
const FORMAT_WITH_YEAR = d3.time.format('%b %-d, %Y');
const FORMAT_WITHOUT_YEAR = d3.time.format('%b %-d');
const FORMAT_TIME_OF_DAY_WITHOUT_MINUTES = d3.time.format('%-I%p');
const FORMAT_TIME_OF_DAY_WITH_MINUTES = d3.time.format('%-I:%M%p');
const FORMAT_FULL_MONTH_WITH_YEAR = d3.time.format('%B %Y');
function formatTimeOfDay(d) {
    return d.getMinutes() ? FORMAT_TIME_OF_DAY_WITH_MINUTES(d) : FORMAT_TIME_OF_DAY_WITHOUT_MINUTES(d);
}
function isCurrentYear(year, timezone) {
    var nowWallTime = chronoshift_1.WallTime.UTCToWallTime(new Date(), timezone.toString());
    return nowWallTime.getFullYear() === year;
}
(function (DisplayYear) {
    DisplayYear[DisplayYear["ALWAYS"] = 0] = "ALWAYS";
    DisplayYear[DisplayYear["NEVER"] = 1] = "NEVER";
    DisplayYear[DisplayYear["IF_DIFF"] = 2] = "IF_DIFF";
})(exports.DisplayYear || (exports.DisplayYear = {}));
var DisplayYear = exports.DisplayYear;
function getEndWallTimeInclusive(exclusiveEnd, timezone) {
    return chronoshift_1.WallTime.UTCToWallTime(exclusiveToInclusiveEnd(exclusiveEnd), timezone.toString());
}
exports.getEndWallTimeInclusive = getEndWallTimeInclusive;
function exclusiveToInclusiveEnd(exclusiveEnd) {
    return new Date(exclusiveEnd.valueOf() - 1);
}
exports.exclusiveToInclusiveEnd = exclusiveToInclusiveEnd;
function formatTimeRange(timeRange, timezone, displayYear) {
    var { start, end } = timeRange;
    var startWallTime = chronoshift_1.WallTime.UTCToWallTime(start, timezone.toString());
    var endWallTime = chronoshift_1.WallTime.UTCToWallTime(end, timezone.toString());
    var endWallTimeInclusive = getEndWallTimeInclusive(end, timezone);
    var showingYear = true;
    var formatted;
    if (startWallTime.getFullYear() !== endWallTimeInclusive.getFullYear()) {
        formatted = [FORMAT_WITH_YEAR(startWallTime), FORMAT_WITH_YEAR(endWallTimeInclusive)].join(' - ');
    }
    else {
        showingYear = displayYear === DisplayYear.ALWAYS || (displayYear === DisplayYear.IF_DIFF && !isCurrentYear(endWallTimeInclusive.getFullYear(), timezone));
        var fmt = showingYear ? FORMAT_WITH_YEAR : FORMAT_WITHOUT_YEAR;
        if (startWallTime.getMonth() !== endWallTimeInclusive.getMonth() || startWallTime.getDate() !== endWallTimeInclusive.getDate()) {
            formatted = [FORMAT_WITHOUT_YEAR(startWallTime), fmt(endWallTimeInclusive)].join(' - ');
        }
        else {
            formatted = fmt(startWallTime);
        }
    }
    if (startWallTime.getHours() || startWallTime.getMinutes() || endWallTime.getHours() || endWallTime.getMinutes()) {
        formatted += (showingYear ? ' ' : ', ');
        var startTimeStr = formatTimeOfDay(startWallTime).toLowerCase();
        var endTimeStr = formatTimeOfDay(endWallTime).toLowerCase();
        if (startTimeStr === endTimeStr) {
            formatted += startTimeStr;
        }
        else {
            if (startTimeStr.substr(-2) === endTimeStr.substr(-2)) {
                startTimeStr = startTimeStr.substr(0, startTimeStr.length - 2);
            }
            formatted += [startTimeStr, endTimeStr].join('-');
        }
    }
    return formatted;
}
exports.formatTimeRange = formatTimeRange;
// calendar utils
function monthToWeeks(firstDayOfMonth, timezone, locale) {
    const weeks = [];
    const firstDayNextMonth = chronoshift_1.month.shift(firstDayOfMonth, timezone, 1);
    let week = [];
    let currentPointer = chronoshift_1.day.floor(firstDayOfMonth, timezone);
    while (currentPointer < firstDayNextMonth) {
        var wallTime = chronoshift_1.WallTime.UTCToWallTime(currentPointer, timezone.toString());
        if ((wallTime.getDay() === locale.weekStart || 0) && week.length > 0) {
            weeks.push(week);
            week = [];
        }
        week.push(currentPointer);
        currentPointer = chronoshift_1.day.shift(currentPointer, timezone, 1);
    }
    // push last week
    if (week.length > 0)
        weeks.push(week);
    return weeks;
}
exports.monthToWeeks = monthToWeeks;
function prependDays(timezone, weekPrependTo, countPrepend) {
    for (var i = 0; i < countPrepend; i++) {
        var firstDate = weekPrependTo[0];
        var shiftedDate = chronoshift_1.day.shift(firstDate, timezone, -1);
        weekPrependTo.unshift(shiftedDate);
    }
    return weekPrependTo;
}
exports.prependDays = prependDays;
function appendDays(timezone, weekAppendTo, countAppend) {
    for (var i = 0; i < countAppend; i++) {
        var lastDate = weekAppendTo[weekAppendTo.length - 1];
        var shiftedDate = chronoshift_1.day.shift(lastDate, timezone, 1);
        weekAppendTo.push(shiftedDate);
    }
    return weekAppendTo;
}
exports.appendDays = appendDays;
function shiftOneDay(floored, timezone) {
    return chronoshift_1.day.shift(floored, timezone, 1);
}
exports.shiftOneDay = shiftOneDay;
function datesEqual(d1, d2) {
    if (!Boolean(d1) === Boolean(d2))
        return false;
    if (d1 === d2)
        return true;
    return d1.valueOf() === d2.valueOf();
}
exports.datesEqual = datesEqual;
function getWallTimeDay(date, timezone) {
    return chronoshift_1.WallTime.UTCToWallTime(date, timezone.toString()).getDate();
}
exports.getWallTimeDay = getWallTimeDay;
function getWallTimeMonthWithYear(date, timezone) {
    return FORMAT_FULL_MONTH_WITH_YEAR(chronoshift_1.WallTime.UTCToWallTime(date, timezone.toString()));
}
exports.getWallTimeMonthWithYear = getWallTimeMonthWithYear;
function wallTimeInclusiveEndEqual(d1, d2, timezone) {
    if (!Boolean(d1) === Boolean(d2))
        return false;
    if (d1 === d2)
        return true;
    const d1InclusiveEnd = wallTimeHelper(getEndWallTimeInclusive(d1, timezone));
    const d2InclusiveEnd = wallTimeHelper(getEndWallTimeInclusive(d2, timezone));
    return datesEqual(d1InclusiveEnd, d2InclusiveEnd);
}
exports.wallTimeInclusiveEndEqual = wallTimeInclusiveEndEqual;
function getWallTimeString(date, timezone, includeTime, delimiter) {
    const wallTimeISOString = cleanISOString(wallTimeHelper(chronoshift_1.WallTime.UTCToWallTime(date, timezone.toString())).toISOString());
    if (includeTime) {
        return wallTimeISOString.replace('T', delimiter || ', ');
    }
    return wallTimeISOString.replace(/:\d\d/, '').split('T')[0];
}
exports.getWallTimeString = getWallTimeString;
function wallTimeHelper(wallTime) {
    return wallTime['wallTime'];
}
function cleanISOString(input) {
    return input.replace(/(\.\d\d\d)?Z?$/, '');
}
function pad(input) {
    if (input < 10)
        return `0${input}`;
    return String(input);
}
function formatTimeBasedOnGranularity(range, granularity, timezone, locale) {
    const wallTimeStart = chronoshift_1.WallTime.UTCToWallTime(range.start, timezone.toString());
    const year = wallTimeStart.getFullYear();
    const month = wallTimeStart.getMonth();
    const day = wallTimeStart.getDate();
    const hour = wallTimeStart.getHours();
    const minute = wallTimeStart.getMinutes();
    const second = wallTimeStart.getSeconds();
    const monthString = locale.shortMonths[month];
    const hourToTwelve = hour % 12 === 0 ? 12 : hour % 12;
    const amPm = (hour / 12) >= 1 ? 'pm' : 'am';
    var granularityString = granularity.toJS();
    var unit = granularityString.substring(granularityString.length - 1);
    switch (unit) {
        case 'S':
            return `${monthString} ${day}, ${pad(hour)}:${pad(minute)}:${pad(second)}`;
        case 'M':
            var prefix = granularityString.substring(0, 2);
            return prefix === "PT" ? `${monthString} ${day}, ${hourToTwelve}:${pad(minute)}${amPm}` : `${monthString}, ${year}`;
        case 'H':
            return `${monthString} ${day}, ${year}, ${hourToTwelve}${amPm}`;
        case 'D':
            return `${monthString} ${day}, ${year}`;
        case 'W':
            return `${formatTimeRange(range, timezone, DisplayYear.ALWAYS)}`;
        default:
            return cleanISOString(wallTimeHelper(wallTimeStart).toISOString());
    }
}
exports.formatTimeBasedOnGranularity = formatTimeBasedOnGranularity;
function formatGranularity(granularity) {
    return granularity.replace(/^PT?/, '');
}
exports.formatGranularity = formatGranularity;
