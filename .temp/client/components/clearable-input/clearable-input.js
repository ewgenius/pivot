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
require('./clearable-input.css');
const React = require('react');
const svg_icon_1 = require('../svg-icon/svg-icon');
function focusOnInput(component) {
    if (!component)
        return;
    component.focus();
}
class ClearableInput extends React.Component {
    constructor() {
        super();
    }
    onChange(e) {
        this.props.onChange(e.target.value);
    }
    onClear() {
        this.props.onChange('');
    }
    render() {
        const { className, type, placeholder, focusOnMount, value, onBlur } = this.props;
        var ref = focusOnMount ? focusOnInput : null;
        var classNames = ['clearable-input'];
        if (className)
            classNames.push(className);
        if (!value)
            classNames.push('empty');
        return React.createElement("div", {className: classNames.join(' ')}, React.createElement("input", {type: type || 'text', placeholder: placeholder, value: value || '', onChange: this.onChange.bind(this), onBlur: onBlur, ref: ref}), React.createElement("div", {className: "clear", onClick: this.onClear.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/x.svg')})));
    }
}
exports.ClearableInput = ClearableInput;
