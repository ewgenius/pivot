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
require('./settings-menu.css');
const React = require('react');
const index_1 = require('../../../common/models/index');
const constants_1 = require('../../config/constants');
const bubble_menu_1 = require('../bubble-menu/bubble-menu');
const dropdown_1 = require('../dropdown/dropdown');
class SettingsMenu extends React.Component {
    constructor() {
        super();
    }
    changeTimezone(newTimezone) {
        const { onClose, changeTimezone } = this.props;
        changeTimezone(newTimezone);
        onClose();
    }
    renderTimezonesDropdown() {
        const { timezone, timezones } = this.props;
        return React.createElement(dropdown_1.Dropdown, {
            label: constants_1.STRINGS.timezone,
            selectedItem: timezone,
            renderItem: (d) => d.toString().replace(/_/g, ' '),
            items: timezones,
            onSelect: this.changeTimezone.bind(this)
        });
    }
    render() {
        const { openOn, onClose } = this.props;
        var stage = index_1.Stage.fromSize(240, 200);
        return React.createElement(bubble_menu_1.BubbleMenu, {className: "settings-menu", direction: "down", stage: stage, openOn: openOn, onClose: onClose}, this.renderTimezonesDropdown());
    }
}
exports.SettingsMenu = SettingsMenu;
