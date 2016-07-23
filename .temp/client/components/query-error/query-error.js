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
require('./query-error.css');
const React = require('react');
const constants_1 = require('../../config/constants');
class QueryError extends React.Component {
    constructor() {
        super();
    }
    render() {
        var { error } = this.props;
        return React.createElement("div", {className: "query-error"}, React.createElement("div", {className: "whiteout"}), React.createElement("div", {className: "error-container"}, React.createElement("div", {className: "error"}, constants_1.STRINGS.queryError), React.createElement("div", {className: "message"}, error.message)));
    }
}
exports.QueryError = QueryError;