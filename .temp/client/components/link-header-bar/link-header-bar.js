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
require('./link-header-bar.css');
const React = require('react');
const svg_icon_1 = require('../svg-icon/svg-icon');
const user_menu_1 = require('../user-menu/user-menu');
class LinkHeaderBar extends React.Component {
    constructor() {
        super();
        this.state = {
            userMenuOpenOn: null
        };
    }
    // User menu
    onUserMenuClick(e) {
        const { userMenuOpenOn } = this.state;
        if (userMenuOpenOn)
            return this.onUserMenuClose();
        this.setState({
            userMenuOpenOn: e.target
        });
    }
    onUserMenuClose() {
        this.setState({
            userMenuOpenOn: null
        });
    }
    renderUserMenu() {
        const { user } = this.props;
        const { userMenuOpenOn } = this.state;
        if (!userMenuOpenOn)
            return null;
        return React.createElement(user_menu_1.UserMenu, {openOn: userMenuOpenOn, onClose: this.onUserMenuClose.bind(this), user: user});
    }
    render() {
        var { title, user, onNavClick, onExploreClick, customization } = this.props;
        var userButton = null;
        if (user) {
            userButton = React.createElement("div", {className: "icon-button user", onClick: this.onUserMenuClick.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/full-user.svg')}));
        }
        var headerStyle = null;
        if (customization && customization.headerBackground) {
            headerStyle = {
                background: customization.headerBackground
            };
        }
        return React.createElement("header", {className: "link-header-bar", style: headerStyle}, React.createElement("div", {className: "left-bar", onClick: onNavClick}, React.createElement("div", {className: "menu-icon"}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/menu.svg')})), React.createElement("div", {className: "title"}, title)), React.createElement("div", {className: "right-bar"}, React.createElement("div", {className: "text-button", onClick: onExploreClick}, "Explore"), React.createElement("a", {className: "icon-button help", href: "https://groups.google.com/forum/#!forum/imply-user-group", target: "_blank"}, React.createElement(svg_icon_1.SvgIcon, {className: "help-icon", svg: require('../../icons/help.svg')})), userButton), this.renderUserMenu());
    }
}
exports.LinkHeaderBar = LinkHeaderBar;
