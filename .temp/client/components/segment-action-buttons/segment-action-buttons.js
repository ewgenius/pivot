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
require('./segment-action-buttons.css');
const React = require('react');
const index_1 = require('../../../common/models/index');
const constants_1 = require('../../config/constants');
const bubble_menu_1 = require('../bubble-menu/bubble-menu');
const button_1 = require('../button/button');
class SegmentActionButtons extends React.Component {
    constructor() {
        super();
        this.state = {
            moreMenuOpenOn: null
        };
    }
    onSelect(e) {
        var { onClose, clicker } = this.props;
        clicker.acceptHighlight();
        if (onClose)
            onClose();
    }
    onCancel(e) {
        var { onClose, clicker } = this.props;
        clicker.dropHighlight();
        if (onClose)
            onClose();
    }
    onMore(e) {
        const { moreMenuOpenOn } = this.state;
        if (moreMenuOpenOn)
            return this.closeMoreMenu();
        this.setState({
            moreMenuOpenOn: e.target
        });
    }
    closeMoreMenu() {
        this.setState({
            moreMenuOpenOn: null
        });
    }
    getUrl() {
        const { segmentLabel, dimension } = this.props;
        if (!dimension || !dimension.url)
            return null;
        return dimension.url.replace(/%s/g, segmentLabel);
    }
    openRawDataModal() {
        const { openRawDataModal } = this.props;
        this.closeMoreMenu();
        openRawDataModal();
    }
    renderMoreMenu() {
        const { segmentLabel } = this.props;
        const { moreMenuOpenOn } = this.state;
        if (!moreMenuOpenOn)
            return null;
        var menuSize = index_1.Stage.fromSize(160, 160);
        const bubbleListItems = [
            React.createElement("li", {className: "clipboard", key: "copyValue", "data-clipboard-text": segmentLabel, onClick: this.closeMoreMenu.bind(this)}, constants_1.STRINGS.copyValue),
            React.createElement("li", {className: "view-raw-data", key: "view-raw-data", onClick: this.openRawDataModal.bind(this)}, constants_1.STRINGS.viewRawData)
        ];
        var url = this.getUrl();
        if (url) {
            bubbleListItems.push(React.createElement("li", {key: "goToUrl"}, React.createElement("a", {href: url, onClick: this.closeMoreMenu.bind(this), target: "_blank"}, constants_1.STRINGS.goToUrl)));
        }
        return React.createElement(bubble_menu_1.BubbleMenu, {className: "more-menu", direction: "down", stage: menuSize, openOn: moreMenuOpenOn, align: "start", onClose: this.closeMoreMenu.bind(this)}, React.createElement("ul", {className: "bubble-list"}, bubbleListItems));
    }
    render() {
        const { disableMoreMenu } = this.props;
        const { moreMenuOpenOn } = this.state;
        return React.createElement("div", {className: "segment-action-buttons"}, React.createElement(button_1.Button, {type: "primary", className: "mini", onClick: this.onSelect.bind(this), title: constants_1.STRINGS.select}), React.createElement(button_1.Button, {type: "secondary", className: "mini", onClick: this.onCancel.bind(this), title: constants_1.STRINGS.cancel}), disableMoreMenu ? null : React.createElement(button_1.Button, {type: "secondary", className: "mini", onClick: this.onMore.bind(this), svg: require('../../icons/full-more-mini.svg'), active: Boolean(moreMenuOpenOn)}), this.renderMoreMenu());
    }
}
exports.SegmentActionButtons = SegmentActionButtons;
