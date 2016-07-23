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
const chronoshift_1 = require('chronoshift');
var check;
class RefreshRule {
    constructor(parameters) {
        var rule = parameters.rule;
        if (rule !== RefreshRule.FIXED && rule !== RefreshRule.QUERY && rule !== RefreshRule.REALTIME) {
            throw new Error(`rule must be on of: ${RefreshRule.FIXED}, ${RefreshRule.QUERY}, or ${RefreshRule.REALTIME}`);
        }
        this.rule = rule;
        this.refresh = parameters.refresh;
        if (this.rule !== RefreshRule.FIXED && !this.refresh) {
            this.refresh = RefreshRule.DEFAULT_QUERY_REFRESH;
        }
        this.time = parameters.time;
    }
    static isRefreshRule(candidate) {
        return immutable_class_1.isInstanceOf(candidate, RefreshRule);
    }
    static query(refresh) {
        return new RefreshRule({
            rule: RefreshRule.QUERY,
            refresh: refresh
        });
    }
    static fromJS(parameters) {
        var value = {
            rule: parameters.rule
        };
        if (parameters.refresh) {
            value.refresh = chronoshift_1.Duration.fromJS(parameters.refresh);
        }
        if (parameters.time) {
            value.time = new Date(parameters.time);
        }
        return new RefreshRule(value);
    }
    valueOf() {
        var value = {
            rule: this.rule
        };
        if (this.refresh) {
            value.refresh = this.refresh;
        }
        if (this.time) {
            value.time = this.time;
        }
        return value;
    }
    toJS() {
        var js = {
            rule: this.rule
        };
        if (this.refresh) {
            js.refresh = this.refresh.toJS();
        }
        if (this.time) {
            js.time = this.time;
        }
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[RefreshRule: ${this.rule}]`;
    }
    equals(other) {
        return RefreshRule.isRefreshRule(other) &&
            this.rule === other.rule &&
            Boolean(this.refresh) === Boolean(other.refresh) &&
            (!this.refresh || this.refresh.equals(other.refresh)) &&
            (!this.time || this.time.valueOf() === other.time.valueOf());
    }
    isFixed() {
        return this.rule === RefreshRule.FIXED;
    }
    isQuery() {
        return this.rule === RefreshRule.QUERY;
    }
    isRealtime() {
        return this.rule === RefreshRule.REALTIME;
    }
    shouldUpdate(maxTime) {
        if (this.isFixed())
            return false;
        if (!maxTime)
            return true;
        var { refresh } = this;
        if (!refresh)
            return false;
        return Date.now() - maxTime.updated.valueOf() > refresh.getCanonicalLength();
    }
}
RefreshRule.FIXED = 'fixed';
RefreshRule.QUERY = 'query';
RefreshRule.REALTIME = 'realtime';
RefreshRule.DEFAULT_QUERY_REFRESH = chronoshift_1.Duration.fromJS('PT1M');
exports.RefreshRule = RefreshRule;
check = RefreshRule;
