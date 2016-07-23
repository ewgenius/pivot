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
require('./scroller.css');
const React = require('react');
const ReactDOM = require('react-dom');
const dom_1 = require('../../utils/dom/dom');
const string_1 = require('../../../common/utils/string/string');
class Scroller extends React.Component {
    constructor() {
        super();
        this.state = {
            scrollTop: 0,
            scrollLeft: 0,
            viewportHeight: 0,
            viewportWidth: 0
        };
        this.globalResizeListener = this.globalResizeListener.bind(this);
    }
    globalResizeListener() {
        this.updateViewport();
    }
    getGutterStyle(side) {
        const { layout } = this.props;
        const { scrollLeft, scrollTop } = this.state;
        switch (side) {
            case "top":
                return {
                    height: layout.top,
                    left: layout.left - scrollLeft,
                    right: layout.right
                };
            case "right":
                return {
                    width: layout.right,
                    right: 0,
                    top: layout.top - scrollTop,
                    bottom: layout.bottom
                };
            case "bottom":
                return {
                    height: layout.bottom,
                    left: layout.left - scrollLeft,
                    right: layout.right,
                    bottom: 0
                };
            case "left":
                return {
                    width: layout.left,
                    left: 0,
                    top: layout.top - scrollTop,
                    bottom: layout.bottom
                };
            default:
                throw new Error("Unknown side for gutter. This shouldn't happen.");
        }
    }
    getCornerStyle(yPos, xPos) {
        const { layout } = this.props;
        var style = {};
        if (xPos === 'left') {
            style.left = 0;
            style.width = layout.left;
        }
        else {
            style.right = 0;
            style.width = layout.right;
        }
        if (yPos === 'top') {
            style.top = 0;
            style.height = layout.top;
        }
        else {
            style.height = layout.bottom;
            style.bottom = 0;
        }
        return style;
    }
    getShadowStyle(side) {
        const { layout } = this.props;
        switch (side) {
            case "top":
                return { top: 0, height: layout.top, left: 0, right: 0 };
            case "right":
                return { width: layout.right, right: 0, top: 0, bottom: 0 };
            case "bottom":
                return { height: layout.bottom, bottom: 0, left: 0, right: 0 };
            case "left":
                return { width: layout.left, left: 0, top: 0, bottom: 0 };
            default:
                throw new Error("Unknown side for shadow. This shouldn't happen.");
        }
    }
    getBodyStyle() {
        const { layout } = this.props;
        const { scrollTop, scrollLeft } = this.state;
        return {
            top: layout.top - scrollTop,
            right: layout.right,
            bottom: layout.bottom,
            left: layout.left - scrollLeft
        };
    }
    getTargetStyle() {
        const { layout } = this.props;
        return {
            width: layout.bodyWidth + layout.left + layout.right,
            height: layout.bodyHeight + layout.top + layout.bottom
        };
    }
    getDOMElement(refName) {
        return ReactDOM.findDOMNode(this.refs[refName]);
    }
    onScroll(e) {
        const { bodyWidth, bodyHeight } = this.props.layout;
        const { viewportWidth, viewportHeight } = this.state;
        var target = e.target;
        var scrollLeft = dom_1.clamp(target.scrollLeft, 0, Math.max(bodyWidth - viewportWidth, 0));
        var scrollTop = dom_1.clamp(target.scrollTop, 0, Math.max(bodyHeight - viewportHeight, 0));
        if (this.props.onScroll !== undefined) {
            this.setState({
                scrollTop: scrollTop,
                scrollLeft: scrollLeft
            }, () => this.props.onScroll(scrollTop, scrollLeft));
        }
        else {
            this.setState({
                scrollTop: scrollTop,
                scrollLeft: scrollLeft
            });
        }
    }
    getRelativeMouseCoordinates(event) {
        const { top, left, bodyWidth, bodyHeight } = this.props.layout;
        const container = this.getDOMElement('eventContainer');
        const { scrollLeft, scrollTop, viewportHeight, viewportWidth } = this.state;
        const rect = container.getBoundingClientRect();
        var i = 0;
        var j = 0;
        var x = dom_1.getXFromEvent(event) - rect.left;
        var y = dom_1.getYFromEvent(event) - rect.top;
        if (x > left && x <= left + viewportWidth) {
            j = 1;
            x += scrollLeft;
        }
        else if (x > left + viewportWidth) {
            j = 2;
            x += bodyWidth - viewportWidth;
        }
        if (y > top && y <= top + viewportHeight) {
            i = 1;
            y += scrollTop;
        }
        else if (y > top + viewportHeight) {
            i = 2;
            y += bodyHeight - viewportHeight;
        }
        return { x: x, y: y, part: Scroller.PARTS[i][j] };
    }
    onClick(event) {
        if (this.props.onClick === undefined)
            return;
        const { x, y, part } = this.getRelativeMouseCoordinates(event);
        this.props.onClick(x, y, part);
    }
    onMouseMove(event) {
        if (this.props.onMouseMove === undefined)
            return;
        const { x, y, part } = this.getRelativeMouseCoordinates(event);
        this.props.onMouseMove(x, y, part);
    }
    renderGutter(side) {
        var element = this.props[`${side}Gutter`];
        if (!element)
            return null;
        return React.createElement("div", {className: `${side}-gutter`, style: this.getGutterStyle(side)}, element);
    }
    shouldHaveShadow(side) {
        const { layout } = this.props;
        const { scrollLeft, scrollTop, viewportHeight, viewportWidth } = this.state;
        if (side === 'top')
            return scrollTop > 0;
        if (side === 'left')
            return scrollLeft > 0;
        if (side === 'bottom')
            return layout.bodyHeight - scrollTop > viewportHeight;
        if (side === 'right')
            return layout.bodyWidth - scrollLeft > viewportWidth;
        throw new Error('Unknown side for shadow : ' + side);
    }
    renderShadow(side) {
        if (!this.props.layout[side])
            return null; // no gutter ? no shadow.
        if (!this.shouldHaveShadow(side))
            return null;
        return React.createElement("div", {className: `${side}-shadow`, style: this.getShadowStyle(side)});
    }
    renderCorner(yPos, xPos) {
        var style = this.getCornerStyle(yPos, xPos);
        var element = this.props[yPos + string_1.firstUp(xPos) + 'Corner'];
        if (!element)
            return null;
        return React.createElement("div", {className: [yPos, xPos, 'corner'].join('-'), style: style}, element);
    }
    componentDidMount() {
        window.addEventListener('resize', this.globalResizeListener);
        this.updateViewport();
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.globalResizeListener);
    }
    componentDidUpdate() {
        this.updateViewport();
    }
    updateViewport() {
        const scroller = this.getDOMElement('Scroller');
        if (!scroller)
            return;
        const rect = scroller.getBoundingClientRect();
        const { top, right, bottom, left } = this.props.layout;
        const newHeight = rect.height - top - bottom;
        const newWidth = rect.width - left - right;
        if (this.state.viewportHeight !== newHeight || this.state.viewportWidth !== newWidth) {
            this.setState({ viewportHeight: newHeight, viewportWidth: newWidth });
        }
    }
    render() {
        const { viewportWidth, viewportHeight } = this.state;
        const { body, overlay, onMouseLeave, layout } = this.props;
        if (!layout)
            return null;
        const { bodyWidth, bodyHeight } = layout;
        let blockHorizontalScroll = bodyWidth <= viewportWidth;
        let blockVerticalScroll = bodyHeight <= viewportHeight;
        return React.createElement("div", {className: "scroller", ref: "Scroller"}, React.createElement("div", {className: "body", style: this.getBodyStyle()}, body), this.renderGutter("top"), this.renderGutter("right"), this.renderGutter("bottom"), this.renderGutter("left"), this.renderCorner("top", "left"), this.renderCorner("top", "right"), this.renderCorner("bottom", "left"), this.renderCorner("bottom", "right"), this.renderShadow("top"), this.renderShadow("right"), this.renderShadow("bottom"), this.renderShadow("left"), overlay ? React.createElement("div", {className: "overlay"}, overlay) : null, React.createElement("div", {className: dom_1.classNames('event-container', { 'no-x-scroll': blockHorizontalScroll, 'no-y-scroll': blockVerticalScroll }), ref: "eventContainer", onScroll: this.onScroll.bind(this), onClick: this.onClick.bind(this), onMouseMove: this.onMouseMove.bind(this), onMouseLeave: onMouseLeave || null}, React.createElement("div", {className: "event-target", style: this.getTargetStyle()})));
    }
}
Scroller.TOP_LEFT_CORNER = 'top-left-corner';
Scroller.TOP_GUTTER = 'top-gutter';
Scroller.TOP_RIGHT_CORNER = 'top-right-corner';
Scroller.LEFT_GUTTER = 'left-gutter';
Scroller.BODY = 'body';
Scroller.RIGHT_GUTTER = 'right-gutter';
Scroller.BOTTOM_LEFT_CORNER = 'bottom-left-corner';
Scroller.BOTTOM_GUTTER = 'bottom-gutter';
Scroller.BOTTOM_RIGHT_CORNER = 'bottom-right-corner';
Scroller.PARTS = [
    [Scroller.TOP_LEFT_CORNER, Scroller.TOP_GUTTER, Scroller.TOP_RIGHT_CORNER],
    [Scroller.LEFT_GUTTER, Scroller.BODY, Scroller.RIGHT_GUTTER],
    [Scroller.BOTTOM_LEFT_CORNER, Scroller.BOTTOM_GUTTER, Scroller.BOTTOM_RIGHT_CORNER]
];
exports.Scroller = Scroller;
