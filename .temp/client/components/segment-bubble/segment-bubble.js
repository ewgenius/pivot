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
require('./segment-bubble.css');
const React = require('react');
const dom_1 = require('../../utils/dom/dom');
const body_portal_1 = require('../body-portal/body-portal');
const shpitz_1 = require('../shpitz/shpitz');
const segment_action_buttons_1 = require('../segment-action-buttons/segment-action-buttons');
const OFFSET_V = -10;
const PER_LETTER_PIXELS = 8;
class SegmentBubble extends React.Component {
    constructor() {
        super();
    }
    render() {
        const { left, top, dimension, segmentLabel, measureLabel, clicker, openRawDataModal, onClose } = this.props;
        var textElement;
        if (segmentLabel) {
            var minTextWidth = dom_1.clamp(segmentLabel.length * PER_LETTER_PIXELS, 80, 300);
            textElement = React.createElement("div", {className: "text", style: { minWidth: minTextWidth }}, React.createElement("div", {className: "segment"}, segmentLabel), measureLabel ? React.createElement("div", {className: "measure-value"}, measureLabel) : null);
        }
        var actionsElement = null;
        if (clicker) {
            actionsElement = React.createElement(segment_action_buttons_1.SegmentActionButtons, {clicker: clicker, dimension: dimension, segmentLabel: segmentLabel, openRawDataModal: openRawDataModal, onClose: onClose});
        }
        return React.createElement(body_portal_1.BodyPortal, {left: left, top: top + OFFSET_V, disablePointerEvents: !clicker}, React.createElement("div", {className: "segment-bubble", ref: "bubble"}, textElement, actionsElement, React.createElement(shpitz_1.Shpitz, {direction: "up"})));
    }
}
exports.SegmentBubble = SegmentBubble;
