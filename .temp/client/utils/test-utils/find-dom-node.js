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
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const body_portal_1 = require('../../components/body-portal/body-portal');
function findDOMNode(element) {
    var portal = TestUtils.scryRenderedComponentsWithType(element, body_portal_1.BodyPortal)[0];
    return portal ? portal.target.childNodes[0] : ReactDOM.findDOMNode(element);
}
exports.findDOMNode = findDOMNode;
