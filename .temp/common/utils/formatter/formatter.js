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
const numeral = require('numeral');
const plywood_1 = require('plywood');
const time_1 = require('../../utils/time/time');
var scales = {
    'a': {
        '': 1,
        'k': 1e3,
        'm': 1e6,
        'b': 1e9,
        't': 1e12
    },
    'b': {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024,
        'TB': 1024 * 1024 * 1024 * 1024,
        'PB': 1024 * 1024 * 1024 * 1024 * 1024,
        'EB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
        'ZB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
        'YB': 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024
    }
};
function getMiddleNumber(values) {
    var filteredAbsData = [];
    for (var v of values) {
        if (v === 0 || isNaN(v) || !isFinite(v))
            continue;
        filteredAbsData.push(Math.abs(v));
    }
    var n = filteredAbsData.length;
    if (n) {
        filteredAbsData.sort((a, b) => b - a);
        return filteredAbsData[Math.ceil((n - 1) / 2)];
    }
    else {
        return 0;
    }
}
exports.getMiddleNumber = getMiddleNumber;
function formatterFromData(values, format) {
    var match = format.match(/^(\S*)( ?)([ab])$/);
    if (match) {
        var numberFormat = match[1];
        var space = match[2];
        var formatType = match[3];
        var middle = getMiddleNumber(values);
        var formatMiddle = numeral(middle).format('0 ' + formatType);
        var unit = formatMiddle.split(' ')[1] || '';
        var scale = scales[formatType][unit];
        var append = unit ? space + unit : '';
        return (n) => {
            if (isNaN(n) || !isFinite(n))
                return '-';
            return numeral(n / scale).format(numberFormat) + append;
        };
    }
    else {
        return (n) => {
            if (isNaN(n) || !isFinite(n))
                return '-';
            return numeral(n).format(format);
        };
    }
}
exports.formatterFromData = formatterFromData;
function formatNumberRange(value) {
    return `${formatValue(value.start || `any`)} to ${formatValue(value.end || `any`)}`;
}
exports.formatNumberRange = formatNumberRange;
function formatValue(value, timezone, displayYear) {
    if (plywood_1.NumberRange.isNumberRange(value)) {
        return formatNumberRange(value);
    }
    else if (plywood_1.TimeRange.isTimeRange(value)) {
        return time_1.formatTimeRange(value, timezone, displayYear);
    }
    else {
        return '' + value;
    }
}
exports.formatValue = formatValue;
function formatFilterClause(dimension, clause, timezone, verbose) {
    var { title, values } = this.getFormattedClause(dimension, clause, timezone, verbose);
    return title ? `${title} ${values}` : values;
}
exports.formatFilterClause = formatFilterClause;
function getFormattedClause(dimension, clause, timezone, verbose) {
    var title = dimension.title;
    var values;
    switch (dimension.kind) {
        case 'boolean':
        case 'number':
        case 'string':
            if (verbose) {
                title += ':';
                values = clause.getLiteralSet().toString();
            }
            else {
                var setElements = clause.getLiteralSet().elements;
                if (setElements.length > 1) {
                    values = `(${setElements.length})`;
                }
                else {
                    title += ':';
                    values = formatValue(setElements[0]);
                }
            }
            break;
        case 'time':
            var timeRange = clause.selection.value;
            if (verbose) {
                title += ':';
                values = time_1.formatTimeRange(timeRange, timezone, time_1.DisplayYear.IF_DIFF);
            }
            else {
                title = '';
                values = time_1.formatTimeRange(timeRange, timezone, time_1.DisplayYear.IF_DIFF);
            }
            break;
        default:
            throw new Error(`unknown kind ${dimension.kind}`);
    }
    return { title: title, values: values };
}
exports.getFormattedClause = getFormattedClause;
