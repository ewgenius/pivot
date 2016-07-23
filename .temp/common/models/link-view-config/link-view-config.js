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
const plywood_1 = require('plywood');
const link_item_1 = require('../link-item/link-item');
var check;
class LinkViewConfig {
    constructor(parameters) {
        this.title = parameters.title;
        this.linkItems = parameters.linkItems;
    }
    static isLinkViewConfig(candidate) {
        return immutable_class_1.isInstanceOf(candidate, LinkViewConfig);
    }
    static fromJS(parameters, context) {
        if (!context)
            throw new Error('LinkViewConfig must have context');
        return new LinkViewConfig({
            title: parameters.title,
            linkItems: parameters.linkItems.map(linkItem => link_item_1.LinkItem.fromJS(linkItem, context))
        });
    }
    valueOf() {
        return {
            title: this.title,
            linkItems: this.linkItems
        };
    }
    toJS() {
        return {
            title: this.title,
            linkItems: this.linkItems.map(linkItem => linkItem.toJS())
        };
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[LinkViewConfig: ${this.title}]`;
    }
    equals(other) {
        return LinkViewConfig.isLinkViewConfig(other) &&
            this.title === other.title &&
            immutable_class_1.immutableArraysEqual(this.linkItems, other.linkItems);
    }
    defaultLinkItem() {
        return this.linkItems[0];
    }
    findByName(name) {
        return plywood_1.helper.findByName(this.linkItems, name);
    }
}
exports.LinkViewConfig = LinkViewConfig;
check = LinkViewConfig;
