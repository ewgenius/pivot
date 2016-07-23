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
require('./hover-multi-bubble.css');
const React = require('react');
const body_portal_1 = require('../body-portal/body-portal');
const segment_action_buttons_1 = require('../segment-action-buttons/segment-action-buttons');
const LEFT_OFFSET = 22;
class HoverMultiBubble extends React.Component {
    constructor() {
        super();
    }
    renderColorSwabs() {
        const { colorEntries } = this.props;
        if (!colorEntries || !colorEntries.length)
            return null;
        var colorSwabs = colorEntries.map((colorEntry) => {
            const { color, segmentLabel, measureLabel } = colorEntry;
            var swabStyle = { background: color };
            return React.createElement("div", {className: "color", key: segmentLabel}, React.createElement("div", {className: "color-swab", style: swabStyle}), React.createElement("div", {className: "color-name"}, segmentLabel), React.createElement("div", {className: "color-value"}, measureLabel));
        });
        return React.createElement("div", {className: "colors"}, colorSwabs);
    }
    render() {
        const { left, top, dimension, segmentLabel, clicker, onClose } = this.props;
        return React.createElement(body_portal_1.BodyPortal, {left: left + LEFT_OFFSET, top: top, disablePointerEvents: !clicker}, React.createElement("div", {className: "hover-multi-bubble"}, React.createElement("div", {className: "bucket"}, segmentLabel), this.renderColorSwabs(), clicker ? React.createElement(segment_action_buttons_1.SegmentActionButtons, {clicker: clicker, dimension: dimension, segmentLabel: segmentLabel, disableMoreMenu: true, onClose: onClose}) : null));
    }
}
exports.HoverMultiBubble = HoverMultiBubble;
