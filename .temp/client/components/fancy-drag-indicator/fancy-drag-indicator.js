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
require('./fancy-drag-indicator.css');
const React = require('react');
const svg_icon_1 = require('../svg-icon/svg-icon');
const constants_1 = require('../../config/constants');
class FancyDragIndicator extends React.Component {
    constructor() {
        super();
    }
    render() {
        const { dragPosition } = this.props;
        if (!dragPosition)
            return null;
        const sectionWidth = constants_1.CORE_ITEM_WIDTH + constants_1.CORE_ITEM_GAP;
        let ghostArrowLeft;
        let dragGhostElement = null;
        if (dragPosition.isInsert()) {
            ghostArrowLeft = dragPosition.insert * sectionWidth - constants_1.CORE_ITEM_GAP / 2;
        }
        else {
            ghostArrowLeft = dragPosition.replace * sectionWidth + constants_1.CORE_ITEM_WIDTH / 2;
            let left = dragPosition.replace * sectionWidth;
            dragGhostElement = React.createElement("div", {className: "drag-ghost-element", style: { left: left }});
        }
        return React.createElement("div", {className: "fancy-drag-indicator"}, dragGhostElement, React.createElement(svg_icon_1.SvgIcon, {className: "drag-ghost-arrow", svg: require('../../icons/drag-arrow.svg'), style: { left: ghostArrowLeft }}));
    }
}
exports.FancyDragIndicator = FancyDragIndicator;
