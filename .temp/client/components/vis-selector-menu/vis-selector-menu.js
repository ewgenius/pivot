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
require('./vis-selector-menu.css');
const React = require('react');
const ReactDOM = require('react-dom');
const svg_icon_1 = require('../svg-icon/svg-icon');
const dom_1 = require('../../utils/dom/dom');
class VisSelectorMenu extends React.Component {
    constructor() {
        super();
        this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
        this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
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
        var myElement = ReactDOM.findDOMNode(this);
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
    onVisSelect(v) {
        var { clicker } = this.props;
        clicker.changeVisualization(v);
        this.setState({
            menuOpen: false
        });
    }
    renderVisItem(v) {
        var { essence } = this.props;
        var { visualization } = essence;
        return React.createElement("div", {className: dom_1.classNames('vis-item', (v.name === visualization.name ? 'selected' : 'not-selected')), key: v.name, onClick: this.onVisSelect.bind(this, v)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/vis-' + v.name + '.svg')}), React.createElement("div", {className: "vis-title"}, v.title));
    }
    render() {
        var { essence } = this.props;
        var { visualizations } = essence;
        var visItems = null;
        if (visualizations) {
            visItems = visualizations.map(v => {
                return this.renderVisItem(v);
            });
        }
        return React.createElement("div", {className: "vis-selector-menu"}, visItems);
    }
}
exports.VisSelectorMenu = VisSelectorMenu;
