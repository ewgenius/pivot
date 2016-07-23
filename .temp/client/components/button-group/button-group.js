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
require('./button-group.css');
const React = require('react');
const dom_1 = require('../../utils/dom/dom');
class ButtonGroup extends React.Component {
    constructor() {
        super();
    }
    renderMembers() {
        const { groupMembers } = this.props;
        return groupMembers.map((button) => {
            return React.createElement("li", {className: dom_1.classNames('group-member', button.className, { 'selected': button.isSelected }), key: button.key, onClick: button.onClick}, button.title);
        });
    }
    render() {
        const { title, className } = this.props;
        return React.createElement("div", {className: dom_1.classNames('button-group', className)}, title ? React.createElement("div", {className: "button-group-title"}, title) : null, React.createElement("ul", {className: "group-container"}, this.renderMembers()));
    }
}
exports.ButtonGroup = ButtonGroup;
