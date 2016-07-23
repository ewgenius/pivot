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
require('./cube-header-bar.css');
const React = require('react');
const immutable_class_1 = require("immutable-class");
const dom_1 = require("../../utils/dom/dom");
const svg_icon_1 = require('../svg-icon/svg-icon');
const hiluk_menu_1 = require('../hiluk-menu/hiluk-menu');
const auto_refresh_menu_1 = require('../auto-refresh-menu/auto-refresh-menu');
const user_menu_1 = require('../user-menu/user-menu');
const settings_menu_1 = require('../settings-menu/settings-menu');
class CubeHeaderBar extends React.Component {
    constructor() {
        super();
        this.state = {
            hilukMenuOpenOn: null,
            autoRefreshMenuOpenOn: null,
            autoRefreshRate: null,
            userMenuOpenOn: null,
            animating: false
        };
    }
    componentDidMount() {
        this.mounted = true;
        const { dataCube } = this.props.essence;
        this.setAutoRefreshFromDataCube(dataCube);
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.essence.dataCube.name !== nextProps.essence.dataCube.name) {
            this.setAutoRefreshFromDataCube(nextProps.essence.dataCube);
        }
        if (!this.props.updatingMaxTime && nextProps.updatingMaxTime) {
            this.setState({ animating: true });
            setTimeout(() => {
                if (!this.mounted)
                    return;
                this.setState({ animating: false });
            }, 1000);
        }
    }
    componentWillUnmount() {
        this.mounted = false;
        this.clearTimerIfExists();
    }
    setAutoRefreshFromDataCube(dataCube) {
        const { refreshRule } = dataCube;
        if (refreshRule.isFixed())
            return;
        this.setAutoRefreshRate(refreshRule.refresh);
    }
    setAutoRefreshRate(rate) {
        const { autoRefreshRate } = this.state;
        if (immutable_class_1.immutableEqual(autoRefreshRate, rate))
            return;
        this.clearTimerIfExists();
        // Make new timer
        var { refreshMaxTime } = this.props;
        if (refreshMaxTime && rate) {
            this.autoRefreshTimer = setInterval(() => {
                refreshMaxTime();
            }, rate.getCanonicalLength());
        }
        this.setState({
            autoRefreshRate: rate
        });
    }
    clearTimerIfExists() {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
            this.autoRefreshTimer = null;
        }
    }
    // Share menu ("hiluk" = share in Hebrew, kind of)
    onHilukMenuClick(e) {
        const { hilukMenuOpenOn } = this.state;
        if (hilukMenuOpenOn)
            return this.onHilukMenuClose();
        this.setState({
            hilukMenuOpenOn: e.target
        });
    }
    onHilukMenuClose() {
        this.setState({
            hilukMenuOpenOn: null
        });
    }
    renderHilukMenu() {
        const { essence, getUrlPrefix, customization, openRawDataModal, getDownloadableDataset } = this.props;
        const { hilukMenuOpenOn } = this.state;
        if (!hilukMenuOpenOn)
            return null;
        var externalViews = null;
        if (customization && customization.externalViews) {
            externalViews = customization.externalViews;
        }
        return React.createElement(hiluk_menu_1.HilukMenu, {essence: essence, openOn: hilukMenuOpenOn, onClose: this.onHilukMenuClose.bind(this), getUrlPrefix: getUrlPrefix, openRawDataModal: openRawDataModal, externalViews: externalViews, getDownloadableDataset: getDownloadableDataset});
    }
    // Auto Refresh menu
    onAutoRefreshMenuClick(e) {
        const { autoRefreshMenuOpenOn } = this.state;
        if (autoRefreshMenuOpenOn)
            return this.onAutoRefreshMenuClose();
        this.setState({
            autoRefreshMenuOpenOn: e.target
        });
    }
    onAutoRefreshMenuClose() {
        this.setState({
            autoRefreshMenuOpenOn: null
        });
    }
    renderAutoRefreshMenu() {
        const { refreshMaxTime, essence } = this.props;
        const { autoRefreshMenuOpenOn, autoRefreshRate } = this.state;
        if (!autoRefreshMenuOpenOn)
            return null;
        return React.createElement(auto_refresh_menu_1.AutoRefreshMenu, {openOn: autoRefreshMenuOpenOn, onClose: this.onAutoRefreshMenuClose.bind(this), autoRefreshRate: autoRefreshRate, setAutoRefreshRate: this.setAutoRefreshRate.bind(this), refreshMaxTime: refreshMaxTime, dataCube: essence.dataCube, timezone: essence.timezone});
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
    // Settings menu
    onSettingsMenuClick(e) {
        const { settingsMenuOpen } = this.state;
        if (settingsMenuOpen)
            return this.onSettingsMenuClose();
        if (e.metaKey && e.altKey) {
            console.log(this.props.essence.toJS());
            return;
        }
        this.setState({
            settingsMenuOpen: e.target
        });
    }
    onSettingsMenuClose() {
        this.setState({
            settingsMenuOpen: null
        });
    }
    renderSettingsMenu() {
        const { changeTimezone, timezone, customization } = this.props;
        const { settingsMenuOpen } = this.state;
        if (!settingsMenuOpen)
            return null;
        return React.createElement(settings_menu_1.SettingsMenu, {timezone: timezone, timezones: customization.getTimezones(), changeTimezone: changeTimezone, openOn: settingsMenuOpen, onClose: this.onSettingsMenuClose.bind(this)});
    }
    render() {
        var { user, onNavClick, essence, customization } = this.props;
        var { animating } = this.state;
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
        return React.createElement("header", {className: "cube-header-bar", style: headerStyle}, React.createElement("div", {className: "left-bar", onClick: onNavClick}, React.createElement("div", {className: "menu-icon"}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/menu.svg')})), React.createElement("div", {className: "title"}, essence.dataCube.title)), React.createElement("div", {className: "right-bar"}, React.createElement("div", {className: dom_1.classNames("icon-button", "auto-refresh", { "refreshing": animating }), onClick: this.onAutoRefreshMenuClick.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {className: "auto-refresh-icon", svg: require('../../icons/full-refresh.svg')})), React.createElement("div", {className: "icon-button hiluk", onClick: this.onHilukMenuClick.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {className: "hiluk-icon", svg: require('../../icons/full-hiluk.svg')})), React.createElement("div", {className: "icon-button settings", onClick: this.onSettingsMenuClick.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {className: "settings-icon", svg: require('../../icons/full-settings.svg')})), userButton), this.renderHilukMenu(), this.renderAutoRefreshMenu(), this.renderSettingsMenu(), this.renderUserMenu());
    }
}
exports.CubeHeaderBar = CubeHeaderBar;
