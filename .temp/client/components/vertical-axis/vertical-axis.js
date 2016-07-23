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
require('./vertical-axis.css');
const React = require('react');
const formatter_1 = require('../../../common/utils/formatter/formatter');
const dom_1 = require('../../utils/dom/dom');
const index_1 = require('../../../common/models/index');
const TICK_WIDTH = 5;
const TEXT_OFFSET = 2;
class VerticalAxis extends React.Component {
    constructor() {
        super();
    }
    render() {
        var { stage, ticks, scale, topLineExtend, hideZero } = this.props;
        if (hideZero)
            ticks = ticks.filter((tick) => tick !== 0);
        var formatter = formatter_1.formatterFromData(ticks, index_1.Measure.DEFAULT_FORMAT);
        var lines = ticks.map((tick) => {
            var y = dom_1.roundToHalfPx(scale(tick));
            return React.createElement("line", {className: "tick", key: String(tick), x1: 0, y1: y, x2: TICK_WIDTH, y2: y});
        });
        var labelX = TICK_WIDTH + TEXT_OFFSET;
        var dy = "0.31em";
        var labels = ticks.map((tick) => {
            var y = scale(tick);
            return React.createElement("text", {className: "tick", key: String(tick), x: labelX, y: y, dy: dy}, formatter(tick));
        });
        return React.createElement("g", {className: "vertical-axis", transform: stage.getTransform()}, React.createElement("line", {className: "border", x1: 0.5, y1: -topLineExtend, x2: 0.5, y2: stage.height}), lines, labels);
    }
}
VerticalAxis.defaultProps = {
    topLineExtend: 0
};
exports.VerticalAxis = VerticalAxis;
