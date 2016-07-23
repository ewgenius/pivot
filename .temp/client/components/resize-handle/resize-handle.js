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
require('./resize-handle.css');
const React = require('react');
const dom_1 = require('../../utils/dom/dom');
const svg_icon_1 = require('../svg-icon/svg-icon');
const dom_2 = require('../../utils/dom/dom');
class ResizeHandle extends React.Component {
    constructor() {
        super();
        this.offset = 0;
        this.state = {};
        this.onGlobalMouseUp = this.onGlobalMouseUp.bind(this);
        this.onGlobalMouseMove = this.onGlobalMouseMove.bind(this);
    }
    componentDidMount() {
        this.setState({
            currentValue: this.constrainValue(this.props.initialValue)
        });
    }
    onMouseDown(event) {
        window.addEventListener('mouseup', this.onGlobalMouseUp);
        window.addEventListener('mousemove', this.onGlobalMouseMove);
        var newX = this.state.currentValue;
        var eventX = this.getValueFromX(dom_2.getXFromEvent(event));
        this.setState({
            dragging: true,
            startValue: newX,
            currentValue: newX,
            anchor: eventX - newX
        });
        event.preventDefault();
    }
    getValueFromX(x) {
        if (this.props.side !== 'right') {
            return this.constrainValue(x);
        }
        return this.constrainValue(window.innerWidth - x);
    }
    constrainValue(value) {
        return dom_1.clamp(value, this.props.min, this.props.max);
    }
    onGlobalMouseMove(event) {
        const { anchor } = this.state;
        let newX = this.getValueFromX(dom_2.getXFromEvent(event)) - anchor;
        this.setState({
            currentValue: newX
        });
        if (!!this.props.onResize) {
            this.props.onResize(newX);
        }
    }
    onGlobalMouseUp(event) {
        this.setState({
            dragging: false
        });
        window.removeEventListener('mouseup', this.onGlobalMouseUp);
        window.removeEventListener('mousemove', this.onGlobalMouseMove);
        if (!!this.props.onResizeEnd) {
            this.props.onResizeEnd(this.state.currentValue);
        }
    }
    render() {
        let { side } = this.props;
        let style = {};
        style[side] = this.state.currentValue;
        let className = 'resize-handle ' + side;
        return React.createElement("div", {className: className, style: style, onMouseDown: this.onMouseDown.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/drag-handle.svg')}));
    }
}
exports.ResizeHandle = ResizeHandle;
