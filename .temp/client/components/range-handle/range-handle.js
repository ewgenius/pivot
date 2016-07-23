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
require('./range-handle.css');
const React = require('react');
const dom_1 = require('../../utils/dom/dom');
class RangeHandle extends React.Component {
    constructor() {
        super();
        this.state = {
            anchor: null
        };
        this.onGlobalMouseUp = this.onGlobalMouseUp.bind(this);
        this.onGlobalMouseMove = this.onGlobalMouseMove.bind(this);
    }
    onGlobalMouseMove(event) {
        const { onChange, leftBound, rightBound } = this.props;
        const { anchor } = this.state;
        let newX = dom_1.getXFromEvent(event) - anchor;
        onChange(dom_1.clamp(newX, leftBound, rightBound));
    }
    onMouseDown(event) {
        const { offset, positionLeft } = this.props;
        let x = dom_1.getXFromEvent(event);
        var anchor = x - offset - positionLeft;
        this.setState({
            anchor: anchor
        });
        event.preventDefault();
        window.addEventListener('mouseup', this.onGlobalMouseUp);
        window.addEventListener('mousemove', this.onGlobalMouseMove);
    }
    onGlobalMouseUp() {
        window.removeEventListener('mouseup', this.onGlobalMouseUp);
        window.removeEventListener('mousemove', this.onGlobalMouseMove);
    }
    render() {
        const { positionLeft, isAny, isBeyondMin, isBeyondMax } = this.props;
        var style = { left: positionLeft };
        return React.createElement("div", {className: dom_1.classNames("range-handle", { empty: isAny, "beyond min": isBeyondMin, "beyond max": isBeyondMax }), style: style, onMouseDown: this.onMouseDown.bind(this)});
    }
}
exports.RangeHandle = RangeHandle;
