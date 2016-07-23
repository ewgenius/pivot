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
const immutable_class_1 = require('immutable-class');
var check;
class MaxTime {
    constructor(parameters) {
        this.time = parameters.time;
        this.updated = parameters.updated;
    }
    static isMaxTime(candidate) {
        return immutable_class_1.isInstanceOf(candidate, MaxTime);
    }
    static fromNow() {
        var now = new Date();
        return new MaxTime({
            time: now,
            updated: now
        });
    }
    static fromDate(time) {
        return new MaxTime({
            time: time,
            updated: new Date()
        });
    }
    static fromJS(parameters) {
        var time = new Date(parameters.time);
        if (isNaN(time)) {
            throw new Error('maxTime must have a valid `time`');
        }
        return new MaxTime({
            time: time,
            updated: new Date((parameters.updated || parameters.time))
        });
    }
    valueOf() {
        return {
            time: this.time,
            updated: this.updated
        };
    }
    toJS() {
        return {
            time: this.time,
            updated: this.updated
        };
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[MaxTime: ${this.time.toISOString()}]`;
    }
    equals(other) {
        return MaxTime.isMaxTime(other) &&
            this.time.valueOf() === other.time.valueOf();
    }
}
exports.MaxTime = MaxTime;
check = MaxTime;
