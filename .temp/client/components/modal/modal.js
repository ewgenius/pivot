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
require('./modal.css');
const React = require('react');
const dom_1 = require('../../utils/dom/dom');
const body_portal_1 = require('../body-portal/body-portal');
const svg_icon_1 = require('../svg-icon/svg-icon');
const golden_center_1 = require('../golden-center/golden-center');
class Modal extends React.Component {
    constructor() {
        super();
        this.focusAlreadyGiven = false;
        this.state = {
            id: null
        };
        this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
        this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
    }
    componentWillMount() {
        var { id } = this.props;
        this.setState({
            id: id || dom_1.uniqueId('modal-')
        });
    }
    componentDidMount() {
        window.addEventListener('mousedown', this.globalMouseDownListener);
        window.addEventListener('keydown', this.globalKeyDownListener);
        this.maybeFocus();
    }
    componentDidUpdate() {
        this.maybeFocus();
    }
    componentWillUnmount() {
        window.removeEventListener('mousedown', this.globalMouseDownListener);
        window.removeEventListener('keydown', this.globalKeyDownListener);
    }
    getChildByID(children, id) {
        if (!children)
            return null;
        const n = children.length;
        for (let i = 0; i < n; i++) {
            let child = children[i];
            if (child.getAttribute && child.getAttribute('id') === id)
                return child;
            if (child.childNodes) {
                let foundChild = this.getChildByID(child.childNodes, id);
                if (foundChild)
                    return foundChild;
            }
        }
        return null;
    }
    maybeFocus() {
        if (this.props.startUpFocusOn) {
            var myElement = document.getElementById(this.state.id);
            let target = this.getChildByID(myElement.childNodes, this.props.startUpFocusOn);
            if (!this.focusAlreadyGiven && !!target) {
                target.focus();
                this.focusAlreadyGiven = true;
            }
        }
    }
    globalMouseDownListener(e) {
        var { onClose, mandatory } = this.props;
        if (mandatory)
            return;
        var { id } = this.state;
        // can not use ReactDOM.findDOMNode(this) because portal?
        var myElement = document.getElementById(id);
        if (!myElement)
            return;
        var target = e.target;
        if (dom_1.isInside(target, myElement))
            return;
        onClose();
    }
    globalKeyDownListener(e) {
        if (dom_1.enterKey(e) && this.props.onEnter)
            this.props.onEnter();
        if (!dom_1.escapeKey(e))
            return;
        var { onClose, mandatory } = this.props;
        if (mandatory)
            return;
        onClose();
    }
    render() {
        var { className, title, children, onClose } = this.props;
        var { id } = this.state;
        var titleElement = null;
        if (typeof title === 'string') {
            titleElement = React.createElement("div", {className: "modal-title"}, React.createElement("div", {className: "text"}, title), React.createElement("div", {className: "close", onClick: onClose}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/full-remove.svg')})));
        }
        return React.createElement(body_portal_1.BodyPortal, {fullSize: true}, React.createElement("div", {className: dom_1.classNames('modal', className)}, React.createElement("div", {className: "backdrop"}), React.createElement(golden_center_1.GoldenCenter, null, React.createElement("div", {className: "modal-window", id: id}, titleElement, children))));
    }
}
exports.Modal = Modal;
