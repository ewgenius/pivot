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
const Qajax = require('qajax');
const plywood_1 = require('plywood');
function getSplitsDescription(ex) {
    var splits = [];
    ex.forEach((ex) => {
        if (ex instanceof plywood_1.ChainExpression) {
            ex.actions.forEach((action) => {
                if (action instanceof plywood_1.SplitAction) {
                    splits.push(action.firstSplitExpression().toString());
                }
            });
        }
    });
    return splits.join(';');
}
var reloadRequested = false;
function reload() {
    if (reloadRequested)
        return;
    reloadRequested = true;
    window.location.reload(true);
}
function queryUrlExecutorFactory(name, url, version) {
    return (ex, env = {}) => {
        return Qajax({
            method: "POST",
            url: url + '?by=' + getSplitsDescription(ex),
            data: {
                version: version,
                dataCube: name,
                expression: ex.toJS(),
                timezone: env ? env.timezone : null
            }
        })
            .then(Qajax.filterSuccess)
            .then(Qajax.toJSON)
            .then((res) => {
            return plywood_1.Dataset.fromJS(res.result);
        }, (xhr) => {
            if (!xhr)
                return null; // This is only here to stop TS complaining
            var jsonError = JSON.parse(xhr.responseText);
            if (jsonError.action === 'reload')
                reload();
            throw new Error(jsonError.message || jsonError.error);
        });
    };
}
exports.queryUrlExecutorFactory = queryUrlExecutorFactory;
