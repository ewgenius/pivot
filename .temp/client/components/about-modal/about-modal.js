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
require('./about-modal.css');
const React = require('react');
const constants_1 = require('../../config/constants');
const modal_1 = require('../modal/modal');
const button_1 = require('../button/button');
class AboutModal extends React.Component {
    constructor() {
        super();
    }
    render() {
        const { version, onClose } = this.props;
        return React.createElement(modal_1.Modal, {className: "about-modal", title: "About Pivot", onClose: onClose}, React.createElement("p", null, "For feedback and support please visit" + ' ' + "the ", React.createElement("a", {href: "https://groups.google.com/forum/#!forum/imply-user-group", target: '_blank'}, "Imply User Group"), "."), React.createElement("p", null, "For bug reports please create an issue on ", React.createElement("a", {href: "https://github.com/implydata/pivot/issues", target: '_blank'}, "GitHub"), "."), React.createElement("p", null, React.createElement("a", {href: "https://github.com/implydata/pivot", target: '_blank'}, "Pivot"), " (version ", version, ") is open source under" + ' ' + "the ", React.createElement("a", {href: "https://github.com/implydata/pivot/blob/master/LICENSE", target: '_blank'}, "Apache 2.0"), " license." + ' ' + "It is being built and maintained with great care by ", React.createElement("a", {href: "http://imply.io/", target: '_blank'}, "imply.io"), "."), React.createElement("div", {className: "button-bar"}, React.createElement(button_1.Button, {type: "primary", onClick: onClose, title: constants_1.STRINGS.close})));
    }
}
exports.AboutModal = AboutModal;
