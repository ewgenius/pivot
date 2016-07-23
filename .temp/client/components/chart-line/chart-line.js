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
require('./chart-line.css');
const immutable_class_1 = require('immutable-class');
const React = require('react');
const d3 = require('d3');
const lineFn = d3.svg.line();
class ChartLine extends React.Component {
    constructor() {
        super();
    }
    render() {
        var { stage, dataset, getY, getX, scaleX, scaleY, color, showArea, hoverRange } = this.props;
        if (!dataset || !color)
            return null;
        var dataPoints = [];
        var hoverDataPoint = null;
        var ds = dataset.data;
        for (var i = 0; i < ds.length; i++) {
            var datum = ds[i];
            var range = getX(datum);
            if (!range)
                return null; // Incorrect data loaded
            var rangeMidpoint = range.midpoint();
            var measureValue = getY(datum);
            // Add potential pre zero point
            var prevDatum = ds[i - 1];
            if (prevDatum) {
                var prevRange = getX(prevDatum);
                if (prevRange.end.valueOf() !== range.start.valueOf()) {
                    dataPoints.push([
                        scaleX(rangeMidpoint.valueOf() - (range.end.valueOf() - range.start.valueOf())),
                        scaleY(0)
                    ]);
                }
            }
            // Add the point itself
            var y = scaleY(measureValue);
            var dataPoint = [scaleX(rangeMidpoint), isNaN(y) ? 0 : y];
            dataPoints.push(dataPoint);
            if (hoverRange && immutable_class_1.immutableEqual(hoverRange, range)) {
                hoverDataPoint = dataPoint;
            }
            // Add potential post zero point
            var nextDatum = ds[i + 1];
            if (nextDatum) {
                var nextRange = getX(nextDatum);
                if (range.end.valueOf() !== nextRange.start.valueOf()) {
                    dataPoints.push([
                        scaleX(rangeMidpoint.valueOf() + (range.end.valueOf() - range.start.valueOf())),
                        scaleY(0)
                    ]);
                }
            }
        }
        var strokeStyle = null;
        var fillStyle = null;
        if (color !== 'default') {
            strokeStyle = { stroke: color };
            fillStyle = { fill: color };
        }
        var areaPath = null;
        var linePath = null;
        var singletonCircle = null;
        if (dataPoints.length > 1) {
            if (showArea) {
                var areaFn = d3.svg.area().y0(scaleY(0));
                areaPath = React.createElement("path", {className: "area", d: areaFn(dataPoints)});
            }
            linePath = React.createElement("path", {className: "line", d: lineFn(dataPoints), style: strokeStyle});
        }
        else if (dataPoints.length === 1) {
            singletonCircle = React.createElement("circle", {className: "singleton", cx: dataPoints[0][0], cy: dataPoints[0][1], r: "2", style: fillStyle});
        }
        var hoverCircle = null;
        if (hoverDataPoint) {
            hoverCircle = React.createElement("circle", {className: "hover", cx: hoverDataPoint[0], cy: hoverDataPoint[1], r: "2.5", style: strokeStyle});
        }
        return React.createElement("g", {className: "chart-line", transform: stage.getTransform()}, areaPath, linePath, singletonCircle, hoverCircle);
    }
}
exports.ChartLine = ChartLine;
