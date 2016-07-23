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
require('./dimension-actions-menu.css');
const React = require('react');
const svg_icon_1 = require('../svg-icon/svg-icon');
const constants_1 = require('../../config/constants');
const index_1 = require('../../../common/models/index');
const bubble_menu_1 = require('../bubble-menu/bubble-menu');
const ACTION_SIZE = 60;
class DimensionActionsMenu extends React.Component {
    constructor() {
        super();
    }
    onFilter() {
        var { dimension, triggerFilterMenu, onClose } = this.props;
        triggerFilterMenu(dimension);
        onClose();
    }
    onSplit() {
        var { clicker, essence, dimension, triggerSplitMenu, onClose } = this.props;
        if (essence.splits.hasSplitOn(dimension) && essence.splits.length() === 1) {
            triggerSplitMenu(dimension);
        }
        else {
            clicker.changeSplit(index_1.SplitCombine.fromExpression(dimension.expression), index_1.VisStrategy.UnfairGame);
        }
        onClose();
    }
    onSubsplit() {
        var { clicker, essence, dimension, triggerSplitMenu, onClose } = this.props;
        if (essence.splits.hasSplitOn(dimension)) {
            triggerSplitMenu(dimension);
        }
        else {
            clicker.addSplit(index_1.SplitCombine.fromExpression(dimension.expression), index_1.VisStrategy.UnfairGame);
        }
        onClose();
    }
    onPin() {
        var { clicker, dimension, onClose } = this.props;
        clicker.pin(dimension);
        onClose();
    }
    render() {
        var { direction, containerStage, openOn, dimension, onClose } = this.props;
        if (!dimension)
            return null;
        var menuSize = index_1.Stage.fromSize(ACTION_SIZE * 2, ACTION_SIZE * 2);
        return React.createElement(bubble_menu_1.BubbleMenu, {className: "dimension-actions-menu", direction: direction, containerStage: containerStage, stage: menuSize, fixedSize: true, openOn: openOn, onClose: onClose}, React.createElement("div", {className: "filter action", onClick: this.onFilter.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/preview-filter.svg')}), React.createElement("div", {className: "action-label"}, constants_1.STRINGS.filter)), React.createElement("div", {className: "pin action", onClick: this.onPin.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/preview-pin.svg')}), React.createElement("div", {className: "action-label"}, constants_1.STRINGS.pin)), React.createElement("div", {className: "split action", onClick: this.onSplit.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/preview-split.svg')}), React.createElement("div", {className: "action-label"}, constants_1.STRINGS.split)), React.createElement("div", {className: "subsplit action", onClick: this.onSubsplit.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/preview-subsplit.svg')}), React.createElement("div", {className: "action-label"}, constants_1.STRINGS.subsplit)));
    }
}
exports.DimensionActionsMenu = DimensionActionsMenu;
