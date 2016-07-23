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
require('./bubble-menu.css');
const React = require('react');
const index_1 = require('../../../common/models/index');
const dom_1 = require('../../utils/dom/dom');
const body_portal_1 = require('../body-portal/body-portal');
const shpitz_1 = require('../shpitz/shpitz');
const OFFSET_H = 10;
const OFFSET_V = 0;
const SCREEN_OFFSET = 5;
class BubbleMenu extends React.Component {
    constructor() {
        super();
        this.state = {
            id: null
        };
        this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
        this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
    }
    componentWillMount() {
        var { alignOn, openOn, direction, align, id } = this.props;
        var rect = (alignOn || openOn).getBoundingClientRect();
        var x;
        var y;
        switch (direction) {
            case 'right':
                x = rect.left + rect.width - OFFSET_H;
                y = rect.top + rect.height / 2;
                break;
            case 'down':
                if (align === 'center') {
                    x = rect.left + rect.width / 2;
                }
                else if (align === 'start') {
                    x = rect.left;
                }
                else {
                    x = rect.left + rect.width;
                }
                y = rect.top + rect.height - OFFSET_V;
                break;
            default:
                throw new Error(`unknown direction: '${direction}'`);
        }
        this.setState({
            id: id || dom_1.uniqueId('bubble-menu-'),
            x: x,
            y: y
        });
    }
    componentDidMount() {
        window.addEventListener('mousedown', this.globalMouseDownListener);
        window.addEventListener('keydown', this.globalKeyDownListener);
    }
    componentWillUnmount() {
        window.removeEventListener('mousedown', this.globalMouseDownListener);
        window.removeEventListener('keydown', this.globalKeyDownListener);
    }
    globalMouseDownListener(e) {
        var { onClose, openOn } = this.props;
        var { id } = this.state;
        // can not use ReactDOM.findDOMNode(this) because portal?
        var myElement = document.getElementById(id);
        if (!myElement)
            return;
        var target = e.target;
        if (dom_1.isInside(target, myElement) || dom_1.isInside(target, openOn))
            return;
        onClose();
    }
    globalKeyDownListener(e) {
        if (!dom_1.escapeKey(e))
            return;
        var { onClose } = this.props;
        onClose();
    }
    render() {
        var { className, direction, stage, fixedSize, containerStage, inside, layout, align, children } = this.props;
        var { id, x, y } = this.state;
        var menuWidth = stage.width;
        var menuHeight = stage.height;
        var menuLeft = 0;
        var menuTop = 0;
        var menuStyle = {};
        if (fixedSize) {
            menuStyle.width = menuWidth;
            menuStyle.height = menuHeight;
        }
        var shpitzStyle = {
            left: 0,
            top: 0
        };
        if (!containerStage) {
            containerStage = new index_1.Stage({
                x: SCREEN_OFFSET,
                y: SCREEN_OFFSET,
                width: window.innerWidth - SCREEN_OFFSET * 2,
                height: window.innerHeight - SCREEN_OFFSET * 2
            });
        }
        switch (direction) {
            case 'right':
                var top = y - menuHeight / 2;
                // constrain
                top = Math.min(Math.max(top, containerStage.y), containerStage.y + containerStage.height - menuHeight);
                menuLeft = x;
                menuTop = top;
                shpitzStyle.top = y - top;
                menuStyle.height = menuHeight;
                break;
            case 'down':
                var left;
                if (align === 'center') {
                    left = x - menuWidth / 2;
                }
                else if (align === 'start') {
                    left = x;
                }
                else {
                    left = x - menuWidth;
                }
                // constrain
                left = Math.min(Math.max(left, containerStage.x), containerStage.x + containerStage.width - menuWidth);
                menuLeft = left;
                menuTop = y;
                shpitzStyle.left = x - left;
                menuStyle.width = menuWidth;
                break;
            default:
                throw new Error(`unknown direction: '${direction}'`);
        }
        var insideId = null;
        if (inside) {
            insideId = inside.id;
            if (!insideId)
                throw new Error('inside element must have id');
        }
        var shpitzElement = null;
        if (align === 'center') {
            shpitzElement = React.createElement(shpitz_1.Shpitz, {style: shpitzStyle, direction: direction});
        }
        var myClass = dom_1.classNames('bubble-menu', direction, className, { mini: layout === 'mini' });
        return React.createElement(body_portal_1.BodyPortal, {left: menuLeft, top: menuTop}, React.createElement("div", {className: myClass, id: id, "data-parent": insideId, style: menuStyle}, children, shpitzElement));
    }
}
BubbleMenu.defaultProps = {
    align: 'center'
};
exports.BubbleMenu = BubbleMenu;
