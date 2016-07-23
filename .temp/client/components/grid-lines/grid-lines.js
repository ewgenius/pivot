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
require('./grid-lines.css');
const React = require('react');
const dom_1 = require('../../utils/dom/dom');
class GridLines extends React.Component {
    constructor() {
        super();
    }
    render() {
        var { orientation, stage, ticks, scale } = this.props;
        var lines = ticks.map((tick) => {
            var lineProps = {
                key: String(tick)
            };
            if (orientation === 'horizontal') {
                var y = dom_1.roundToHalfPx(scale(tick));
                lineProps.x1 = 0;
                lineProps.x2 = stage.width;
                lineProps.y1 = y;
                lineProps.y2 = y;
            }
            else {
                var x = dom_1.roundToHalfPx(scale(tick));
                lineProps.x1 = x;
                lineProps.x2 = x;
                lineProps.y1 = 0;
                lineProps.y2 = stage.height;
            }
            return React.createElement('line', lineProps);
        });
        return React.createElement("g", {className: dom_1.classNames('grid-lines', orientation), transform: stage.getTransform()}, lines);
    }
}
exports.GridLines = GridLines;
