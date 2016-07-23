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
require('./remove-modal.css');
const React = require('react');
const button_1 = require('../../../components/button/button');
const modal_1 = require('../../../components/modal/modal');
class RemoveModal extends React.Component {
    constructor() {
        super();
        this.hasInitialized = false;
        this.state = {};
        this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
    }
    componentDidMount() {
        window.addEventListener('keydown', this.globalKeyDownListener);
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this.globalKeyDownListener);
    }
    globalKeyDownListener(e) {
    }
    render() {
        const { itemTitle } = this.props;
        return React.createElement(modal_1.Modal, {className: "remove-modal", title: `Delete "${itemTitle}"`, onClose: this.props.onCancel}, React.createElement("p", null, "Are you sure you would like to delete the data cube \"", itemTitle, "\"?"), React.createElement("p", null, "This action is not reversible."), React.createElement("div", {className: "button-group"}, React.createElement(button_1.Button, {className: "delete", title: "Delete", type: "warn", onClick: this.props.onOK}), React.createElement(button_1.Button, {className: "cancel", title: "Cancel", type: "secondary", onClick: this.props.onCancel})));
    }
}
exports.RemoveModal = RemoveModal;
