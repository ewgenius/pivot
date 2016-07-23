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
const link_item_mock_1 = require("../link-item/link-item.mock");
const link_view_config_1 = require('./link-view-config');
class LinkViewConfigMock {
    static testOneOnlyJS() {
        return {
            title: 'The Links Will Rise Again!',
            linkItems: [
                link_item_mock_1.LinkItemMock.testOneJS()
            ]
        };
    }
    static testOneTwoJS() {
        return {
            title: 'The Links Will Be Reloaded!',
            linkItems: [
                link_item_mock_1.LinkItemMock.testOneJS(),
                link_item_mock_1.LinkItemMock.testTwoJS()
            ]
        };
    }
    static getContext() {
        return link_item_mock_1.LinkItemMock.getContext();
    }
    static testOneOnly() {
        return link_view_config_1.LinkViewConfig.fromJS(LinkViewConfigMock.testOneOnlyJS(), LinkViewConfigMock.getContext());
    }
    static testOneTwo() {
        return link_view_config_1.LinkViewConfig.fromJS(LinkViewConfigMock.testOneTwoJS(), LinkViewConfigMock.getContext());
    }
}
exports.LinkViewConfigMock = LinkViewConfigMock;
