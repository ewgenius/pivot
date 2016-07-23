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
const index_1 = require('../../models/index');
const manifest_1 = require('../../models/manifest/manifest');
class CircumstancesHandler {
    constructor() {
        this.configurations = [];
        this.actions = [];
    }
    static noSplits() {
        return (splits) => splits.length() === 0;
    }
    static testKind(kind, selector) {
        if (selector === '*') {
            return true;
        }
        var bareSelector = selector.replace(/^!/, '');
        // This can be enriched later, right now it's just a 1-1 match
        var result = kind === bareSelector;
        if (selector.charAt(0) === '!') {
            return !result;
        }
        return result;
    }
    static strictCompare(selectors, kinds) {
        if (selectors.length !== kinds.length)
            return false;
        return selectors.every((selector, i) => CircumstancesHandler.testKind(kinds[i], selector));
    }
    static EMPTY() {
        return new CircumstancesHandler();
    }
    when(configuration) {
        let temp = [configuration];
        let ret = {
            or: (conf) => {
                temp.push(conf);
                return ret;
            },
            then: (action) => {
                this.configurations.push(temp);
                this.actions.push(action);
                return this;
            }
        };
        return ret;
    }
    otherwise(action) {
        this.otherwiseAction = action;
        return this;
    }
    needsAtLeastOneSplit(message) {
        return this
            .when(CircumstancesHandler.noSplits())
            .then((splits, dataCube) => {
            var someDimensions = dataCube.dimensions.toArray().filter(d => d.kind === 'string').slice(0, 2);
            return manifest_1.Resolve.manual(4, message, someDimensions.map((someDimension) => {
                return {
                    description: `Add a split on ${someDimension.title}`,
                    adjustment: {
                        splits: index_1.Splits.fromSplitCombine(index_1.SplitCombine.fromExpression(someDimension.expression))
                    }
                };
            }));
        });
    }
    evaluate(dataCube, splits, colors, current) {
        for (let i = 0; i < this.configurations.length; i++) {
            let confs = this.configurations[i];
            if (confs.some((c) => c(splits, dataCube))) {
                return this.actions[i](splits, dataCube, colors, current);
            }
        }
        return this.otherwiseAction(splits, dataCube, colors, current);
    }
}
CircumstancesHandler.areExactSplitKinds = (...selectors) => {
    return (splits, dataCube) => {
        var kinds = splits.toArray().map((split) => split.getDimension(dataCube.dimensions).kind);
        return CircumstancesHandler.strictCompare(selectors, kinds);
    };
};
CircumstancesHandler.haveAtLeastSplitKinds = (...kinds) => {
    return (splits, dataCube) => {
        let getKind = (split) => split.getDimension(dataCube.dimensions).kind;
        let actualKinds = splits.toArray().map(getKind);
        return kinds.every((kind) => actualKinds.indexOf(kind) > -1);
    };
};
exports.CircumstancesHandler = CircumstancesHandler;
