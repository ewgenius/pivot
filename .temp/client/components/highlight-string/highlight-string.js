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
require('./highlight-string.css');
const React = require('react');
const dom_1 = require('../../utils/dom/dom');
class HighlightString extends React.Component {
    constructor() {
        super();
    }
    highlightInString() {
        var { text, highlightText } = this.props;
        if (!highlightText)
            return text;
        var strLower = text.toLowerCase();
        var startIndex = strLower.indexOf(highlightText.toLowerCase());
        if (startIndex === -1)
            return text;
        var endIndex = startIndex + highlightText.length;
        return [
            React.createElement("span", {className: "pre", key: "pre"}, text.substring(0, startIndex)),
            React.createElement("span", {className: "bold", key: "bold"}, text.substring(startIndex, endIndex)),
            React.createElement("span", {className: "post", key: "post"}, text.substring(endIndex))
        ];
    }
    render() {
        var { className } = this.props;
        return React.createElement("span", {className: dom_1.classNames('highlight-string', className)}, this.highlightInString());
    }
}
exports.HighlightString = HighlightString;
