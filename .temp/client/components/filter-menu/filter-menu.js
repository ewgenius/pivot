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
require('./filter-menu.css');
const React = require('react');
const index_1 = require('../../../common/models/index');
const bubble_menu_1 = require('../bubble-menu/bubble-menu');
const string_filter_menu_1 = require('../string-filter-menu/string-filter-menu');
const time_filter_menu_1 = require('../time-filter-menu/time-filter-menu');
const number_filter_menu_1 = require('../number-filter-menu/number-filter-menu');
class FilterMenu extends React.Component {
    constructor() {
        super();
    }
    render() {
        var { clicker, essence, changePosition, direction, containerStage, openOn, dimension, onClose, inside } = this.props;
        if (!dimension)
            return null;
        var menuSize = null;
        var menuCont = null;
        if (dimension.kind === 'time') {
            menuSize = index_1.Stage.fromSize(250, 274);
            menuCont = React.createElement(time_filter_menu_1.TimeFilterMenu, {clicker: clicker, dimension: dimension, essence: essence, onClose: onClose});
        }
        else if (dimension.kind === 'number') {
            menuSize = index_1.Stage.fromSize(250, 274);
            menuCont = React.createElement(number_filter_menu_1.NumberFilterMenu, {clicker: clicker, dimension: dimension, essence: essence, onClose: onClose});
        }
        else {
            menuSize = index_1.Stage.fromSize(250, 410);
            menuCont = React.createElement(string_filter_menu_1.StringFilterMenu, {clicker: clicker, dimension: dimension, essence: essence, changePosition: changePosition, onClose: onClose});
        }
        return React.createElement(bubble_menu_1.BubbleMenu, {className: "filter-menu", direction: direction, containerStage: containerStage, stage: menuSize, openOn: openOn, onClose: onClose, inside: inside}, menuCont);
    }
}
exports.FilterMenu = FilterMenu;
