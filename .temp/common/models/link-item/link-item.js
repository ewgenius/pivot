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
const general_1 = require('../../utils/general/general');
const essence_1 = require('../essence/essence');
var check;
class LinkItem {
    constructor(parameters) {
        var name = parameters.name;
        general_1.verifyUrlSafeName(name);
        this.name = name;
        this.title = parameters.title || general_1.makeTitle(name);
        this.description = parameters.description || '';
        this.group = parameters.group;
        this.dataCube = parameters.dataCube;
        this.essence = parameters.essence;
    }
    static isLinkItem(candidate) {
        return immutable_class_1.isInstanceOf(candidate, LinkItem);
    }
    static fromJS(parameters, context) {
        if (!context)
            throw new Error('LinkItem must have context');
        const { dataCubes, visualizations } = context;
        var dataCubeName = parameters.dataCube;
        var dataCube = plywood_1.helper.find(dataCubes, d => d.name === dataCubeName);
        if (!dataCube)
            throw new Error(`can not find dataCube '${dataCubeName}'`);
        var essence = essence_1.Essence.fromJS(parameters.essence, { dataCube: dataCube, visualizations: visualizations }).updateSplitsWithFilter();
        return new LinkItem({
            name: parameters.name,
            title: parameters.title,
            description: parameters.description,
            group: parameters.group,
            dataCube: dataCube,
            essence: essence
        });
    }
    valueOf() {
        return {
            name: this.name,
            title: this.title,
            description: this.description,
            group: this.group,
            dataCube: this.dataCube,
            essence: this.essence
        };
    }
    toJS() {
        return {
            name: this.name,
            title: this.title,
            description: this.description,
            group: this.group,
            dataCube: this.dataCube.name,
            essence: this.essence.toJS()
        };
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[LinkItem: ${this.name}]`;
    }
    equals(other) {
        return LinkItem.isLinkItem(other) &&
            this.name === other.name &&
            this.title === other.title &&
            this.description === other.description &&
            this.group === other.group &&
            this.dataCube.equals(other.dataCube) &&
            this.essence.equals(other.essence);
    }
}
exports.LinkItem = LinkItem;
check = LinkItem;
