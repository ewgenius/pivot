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
require('./form-label.css');
const React = require('react');
const svg_icon_1 = require('../svg-icon/svg-icon');
const dom_1 = require('../../utils/dom/dom');
const string_1 = require('../../../common/utils/string/string');
class FormLabel extends React.Component {
    constructor() {
        super();
        this.state = { helpVisible: false };
    }
    static simpleGenerator(labels, errors, isBubble = false) {
        return (name) => {
            return React.createElement(FormLabel, {isBubble: isBubble, label: labels[name].label, helpText: labels[name].help, errorText: errors[name] ? (errors[name] || labels[name].error) : undefined});
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.errorText) {
            if (!this.state.helpVisible)
                this.setState({ helpVisible: true, hideHelpIfNoError: true });
        }
        else if (this.state.hideHelpIfNoError) {
            this.setState({ helpVisible: false, hideHelpIfNoError: false });
        }
        else {
            this.setState({ hideHelpIfNoError: false });
        }
    }
    onHelpClick() {
        this.setState({ helpVisible: !this.state.helpVisible, hideHelpIfNoError: false });
    }
    renderIcon() {
        const { helpText, errorText } = this.props;
        if (!helpText && !errorText)
            return null;
        const { helpVisible } = this.state;
        if (errorText) {
            return React.createElement("div", {className: "icon-container error", onClick: this.onHelpClick.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {className: "icon", svg: require(`../../icons/help.svg`)}));
        }
        if (helpVisible) {
            return React.createElement("div", {className: "icon-container visible", onClick: this.onHelpClick.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {className: "icon", svg: require(`../../icons/help.svg`)}));
        }
        return React.createElement("div", {className: "icon-container", onClick: this.onHelpClick.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {className: "icon", svg: require(`../../icons/help.svg`)}));
    }
    renderAdditionalText() {
        const { helpText, errorText } = this.props;
        const { helpVisible } = this.state;
        if (!helpVisible && !errorText)
            return null;
        return React.createElement("div", {className: "additional-text"}, errorText ? React.createElement("div", {className: "error-text"}, string_1.firstUp(errorText)) : null, helpVisible ? React.createElement("div", {className: "help-text", dangerouslySetInnerHTML: { __html: helpText }}) : null);
    }
    render() {
        const { label, errorText, isBubble } = this.props;
        return React.createElement("div", {className: dom_1.classNames('form-label', { error: !!errorText, bubble: isBubble })}, React.createElement("div", {className: "label"}, label), this.renderIcon(), this.renderAdditionalText());
    }
}
exports.FormLabel = FormLabel;
