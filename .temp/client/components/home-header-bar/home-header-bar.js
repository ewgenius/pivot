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
require('./home-header-bar.css');
const React = require('react');
const svg_icon_1 = require('../svg-icon/svg-icon');
const user_menu_1 = require('../user-menu/user-menu');
class HomeHeaderBar extends React.Component {
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
        var { user, onNavClick, customization, title } = this.props;
        // One day
        //<div className="icon-button" onClick={this.handleSettings.bind(this)}>
        //  <SvgIcon className="not-implemented" svg={require('../../icons/full-settings.svg')}/>
        //</div>
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
        return React.createElement("header", {className: "home-header-bar", style: headerStyle}, React.createElement("div", {className: "left-bar", onClick: onNavClick}, React.createElement("div", {className: "menu-icon"}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/menu.svg')})), React.createElement("div", {className: "title"}, title)), React.createElement("div", {className: "right-bar"}, this.props.children, userButton), this.renderUserMenu());
    }
}
exports.HomeHeaderBar = HomeHeaderBar;
