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
require('./highlighter.css');
const React = require('react');
class Highlighter extends React.Component {
    constructor() {
        super();
    }
    render() {
        const { highlightRange, scaleX } = this.props;
        if (!highlightRange)
            return null;
        var startPos = scaleX(highlightRange.start);
        var endPos = scaleX(highlightRange.end);
        var whiteoutLeftStyle = {
            width: Math.max(startPos, 0)
        };
        var frameStyle = {
            left: startPos,
            width: Math.max(endPos - startPos, 0)
        };
        var whiteoutRightStyle = {
            left: endPos
        };
        return React.createElement("div", {className: "highlighter"}, React.createElement("div", {className: "whiteout left", style: whiteoutLeftStyle}), React.createElement("div", {className: "frame", style: frameStyle}), React.createElement("div", {className: "whiteout right", style: whiteoutRightStyle}));
    }
}
exports.Highlighter = Highlighter;
