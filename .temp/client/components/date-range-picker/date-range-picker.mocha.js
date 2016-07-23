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
const chai_1 = require('chai');
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const chronoshift_1 = require('chronoshift');
require('../../utils/test-utils/index');
const date_range_picker_1 = require('./date-range-picker');
var { WallTime } = require('chronoshift');
if (!WallTime.rules) {
    var tzData = require("chronoshift/lib/walltime/walltime-data.js");
    WallTime.init(tzData.rules, tzData.zones);
}
describe('DateRangePicker', () => {
    it('adds the correct class', () => {
        var renderedComponent = TestUtils.renderIntoDocument(React.createElement(date_range_picker_1.DateRangePicker, {startTime: new Date(Date.UTC(2003, 11, 2)), endTime: new Date(Date.UTC(2004, 11, 2)), maxTime: new Date(Date.UTC(2004, 11, 2)), timezone: chronoshift_1.Timezone.UTC, onStartChange: () => { }, onEndChange: () => { }}));
        chai_1.expect(TestUtils.isCompositeComponent(renderedComponent), 'should be composite').to.equal(true);
        chai_1.expect(ReactDOM.findDOMNode(renderedComponent).className, 'should contain class').to.contain('date-range-picker');
    });
    it('throws on non round start time input', () => {
        chai_1.expect(() => {
            TestUtils.renderIntoDocument(React.createElement(date_range_picker_1.DateRangePicker, {startTime: new Date(Date.UTC(2003, 11, 2, 2, 4)), endTime: new Date(Date.UTC(2004, 11, 2)), maxTime: new Date(Date.UTC(2004, 11, 2)), timezone: chronoshift_1.Timezone.UTC, onStartChange: () => { }, onEndChange: () => { }}));
        }).to.throw('start time must be round');
    });
    it('throws on non round end time input', () => {
        chai_1.expect(() => {
            TestUtils.renderIntoDocument(React.createElement(date_range_picker_1.DateRangePicker, {startTime: new Date(Date.UTC(2003, 11, 2)), endTime: new Date(Date.UTC(2004, 11, 2, 2, 3)), maxTime: new Date(Date.UTC(2004, 11, 2)), timezone: chronoshift_1.Timezone.UTC, onStartChange: () => { }, onEndChange: () => { }}));
        }).to.throw('end time must be round');
    });
    it('does not error on null end time', () => {
        chai_1.expect(() => {
            TestUtils.renderIntoDocument(React.createElement(date_range_picker_1.DateRangePicker, {startTime: new Date(Date.UTC(2003, 11, 2)), endTime: null, maxTime: new Date(Date.UTC(2004, 11, 2)), timezone: chronoshift_1.Timezone.UTC, onStartChange: () => { }, onEndChange: () => { }}));
        }).to.not.throw();
    });
});
