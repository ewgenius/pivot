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
const index_1 = require('../../utils/index');
const chronoshift_1 = require('chronoshift');
const external_view_1 = require('../external-view/external-view');
var { WallTime } = require('chronoshift');
if (!WallTime.rules) {
    var tzData = require("chronoshift/lib/walltime/walltime-data.js");
    WallTime.init(tzData.rules, tzData.zones);
}
var check;
class Customization {
    constructor(parameters) {
        this.title = parameters.title || null;
        this.headerBackground = parameters.headerBackground || null;
        this.customLogoSvg = parameters.customLogoSvg || null;
        if (parameters.externalViews)
            this.externalViews = parameters.externalViews;
        if (parameters.timezones)
            this.timezones = parameters.timezones;
    }
    static isCustomization(candidate) {
        return immutable_class_1.isInstanceOf(candidate, Customization);
    }
    static fromJS(parameters) {
        var value = {
            title: parameters.title,
            headerBackground: parameters.headerBackground,
            customLogoSvg: parameters.customLogoSvg
        };
        var paramViewsJS = parameters.externalViews;
        var externalViews = null;
        if (Array.isArray(paramViewsJS)) {
            externalViews = paramViewsJS.map((view, i) => external_view_1.ExternalView.fromJS(view));
            value.externalViews = externalViews;
        }
        var timezonesJS = parameters.timezones;
        var timezones = null;
        if (Array.isArray(timezonesJS)) {
            timezones = timezonesJS.map(chronoshift_1.Timezone.fromJS);
            value.timezones = timezones;
        }
        return new Customization(value);
    }
    valueOf() {
        return {
            title: this.title,
            headerBackground: this.headerBackground,
            customLogoSvg: this.customLogoSvg,
            externalViews: this.externalViews,
            timezones: this.timezones
        };
    }
    toJS() {
        var js = {};
        if (this.title)
            js.title = this.title;
        if (this.headerBackground)
            js.headerBackground = this.headerBackground;
        if (this.customLogoSvg)
            js.customLogoSvg = this.customLogoSvg;
        if (this.externalViews) {
            js.externalViews = this.externalViews.map(view => view.toJS());
        }
        if (this.timezones) {
            js.timezones = this.timezones.map(tz => tz.toJS());
        }
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[custom: (${this.headerBackground}) logo: ${Boolean(this.customLogoSvg)}, externalViews: ${Boolean(this.externalViews)}, timezones: ${Boolean(this.timezones)}]`;
    }
    equals(other) {
        return Customization.isCustomization(other) &&
            this.title === other.title &&
            this.headerBackground === other.headerBackground &&
            this.customLogoSvg === other.customLogoSvg &&
            immutable_class_1.immutableArraysEqual(this.externalViews, other.externalViews) &&
            immutable_class_1.immutableArraysEqual(this.timezones, other.timezones);
    }
    getTitle(version) {
        var title = this.title || Customization.DEFAULT_TITLE;
        return title.replace(/%v/g, version);
    }
    change(propertyName, newValue) {
        return index_1.ImmutableUtils.change(this, propertyName, newValue);
    }
    changeTitle(title) {
        return this.change('title', title);
    }
    getTimezones() {
        return this.timezones || Customization.DEFAULT_TIMEZONES;
    }
}
Customization.DEFAULT_TITLE = 'Pivot (%v)';
Customization.DEFAULT_TIMEZONES = [
    new chronoshift_1.Timezone("America/Juneau"),
    new chronoshift_1.Timezone("America/Los_Angeles"),
    new chronoshift_1.Timezone("America/Yellowknife"),
    new chronoshift_1.Timezone("America/Phoenix"),
    new chronoshift_1.Timezone("America/Denver"),
    new chronoshift_1.Timezone("America/Mexico_City"),
    new chronoshift_1.Timezone("America/Chicago"),
    new chronoshift_1.Timezone("America/New_York"),
    new chronoshift_1.Timezone("America/Argentina/Buenos_Aires"),
    chronoshift_1.Timezone.UTC,
    new chronoshift_1.Timezone("Asia/Jerusalem"),
    new chronoshift_1.Timezone("Europe/Paris"),
    new chronoshift_1.Timezone("Asia/Kathmandu"),
    new chronoshift_1.Timezone("Asia/Hong_Kong"),
    new chronoshift_1.Timezone("Asia/Seoul"),
    new chronoshift_1.Timezone("Pacific/Guam") // +10.0
];
exports.Customization = Customization;
check = Customization;
