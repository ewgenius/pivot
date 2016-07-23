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
require('./auto-refresh-menu.css');
const React = require('react');
const chronoshift_1 = require('chronoshift');
const index_1 = require('../../../common/models/index');
const constants_1 = require('../../config/constants');
const bubble_menu_1 = require('../bubble-menu/bubble-menu');
const dropdown_1 = require('../dropdown/dropdown');
const AUTO_REFRESH_LABELS = {
    "null": "Off",
    "PT5S": "Every 5 seconds",
    "PT15S": "Every 15 seconds",
    "PT1M": "Every minute",
    "PT5M": "Every 5 minutes",
    "PT10M": "Every 10 minutes",
    "PT30M": "Every 30 minutes"
};
const REFRESH_DURATIONS = [
    null,
    chronoshift_1.Duration.fromJS("PT5S"),
    chronoshift_1.Duration.fromJS("PT15S"),
    chronoshift_1.Duration.fromJS("PT1M"),
    chronoshift_1.Duration.fromJS("PT5M"),
    chronoshift_1.Duration.fromJS("PT10M"),
    chronoshift_1.Duration.fromJS("PT30M")
];
class AutoRefreshMenu extends React.Component {
    constructor() {
        super();
    }
    onRefreshNowClick() {
        var { refreshMaxTime } = this.props;
        refreshMaxTime();
    }
    renderRefreshIntervalDropdown() {
        const { autoRefreshRate, setAutoRefreshRate } = this.props;
        const DurationDropdown = dropdown_1.Dropdown.specialize();
        return React.createElement(DurationDropdown, {label: constants_1.STRINGS.autoUpdate, items: REFRESH_DURATIONS, selectedItem: autoRefreshRate, renderItem: (d) => AUTO_REFRESH_LABELS[String(d)] || `Custom ${d}`, onSelect: setAutoRefreshRate});
    }
    render() {
        var { openOn, onClose, dataCube, timezone } = this.props;
        var stage = index_1.Stage.fromSize(240, 200);
        return React.createElement(bubble_menu_1.BubbleMenu, {className: "auto-refresh-menu", direction: "down", stage: stage, openOn: openOn, onClose: onClose}, this.renderRefreshIntervalDropdown(), React.createElement("button", {className: "update-now-button", onClick: this.onRefreshNowClick.bind(this)}, "Update now"), React.createElement("div", {className: "update-info"}, dataCube.updatedText(timezone)));
    }
}
exports.AutoRefreshMenu = AutoRefreshMenu;
