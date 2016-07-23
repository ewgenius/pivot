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
require('./pivot-application.css');
const React = require('react');
const plywood_1 = require('plywood');
const function_slot_1 = require('../../utils/function-slot/function-slot');
const home_view_1 = require('../home-view/home-view');
const link_view_1 = require('../link-view/link-view');
const cube_view_1 = require('../cube-view/cube-view');
const settings_view_1 = require('../settings-view/settings-view');
exports.HOME = "home";
exports.CUBE = "cube";
exports.LINK = "link";
exports.SETTINGS = "settings";
class PivotApplication extends React.Component {
    constructor() {
        super();
        this.hashUpdating = false;
        this.sideBarHrefFn = function_slot_1.createFunctionSlot();
        this.state = {
            appSettings: null,
            drawerOpen: false,
            selectedDataCube: null,
            viewType: null,
            viewHash: null,
            showAboutModal: false
        };
        this.globalHashChangeListener = this.globalHashChangeListener.bind(this);
    }
    componentWillMount() {
        var { appSettings } = this.props;
        var { dataCubes } = appSettings;
        var hash = window.location.hash;
        var viewType = this.getViewTypeFromHash(hash);
        if (viewType !== exports.SETTINGS && !dataCubes.length)
            throw new Error('must have data cubes');
        var selectedDataCube = this.getDataCubeFromHash(appSettings.dataCubes, hash);
        var viewHash = this.getViewHashFromHash(hash);
        // If data cube does not exit bounce to home
        if (viewType === exports.CUBE && !selectedDataCube) {
            this.changeHash('');
            viewType = exports.HOME;
        }
        if (viewType === exports.HOME && dataCubes.length === 1) {
            viewType = exports.CUBE;
            selectedDataCube = dataCubes[0];
        }
        this.setState({
            viewType: viewType,
            viewHash: viewHash,
            selectedDataCube: selectedDataCube,
            appSettings: appSettings
        });
    }
    componentDidMount() {
        window.addEventListener('hashchange', this.globalHashChangeListener);
        require.ensure(['clipboard'], (require) => {
            var Clipboard = require('clipboard');
            var clipboard = new Clipboard('.clipboard');
            clipboard.on('success', (e) => {
                // ToDo: do something here
            });
        }, 'clipboard');
        require.ensure(['react-addons-css-transition-group', '../../components/side-drawer/side-drawer'], (require) => {
            this.setState({
                ReactCSSTransitionGroupAsync: require('react-addons-css-transition-group'),
                SideDrawerAsync: require('../../components/side-drawer/side-drawer').SideDrawer
            });
        }, 'side-drawer');
        require.ensure(['../../components/about-modal/about-modal'], (require) => {
            this.setState({
                AboutModalAsync: require('../../components/about-modal/about-modal').AboutModal
            });
        }, 'about-modal');
        require.ensure(['../../components/notifications/notifications'], (require) => {
            this.setState({
                NotificationsAsync: require('../../components/notifications/notifications').Notifications
            });
        }, 'notifications');
    }
    componentWillUnmount() {
        window.removeEventListener('hashchange', this.globalHashChangeListener);
    }
    globalHashChangeListener() {
        if (this.hashUpdating)
            return;
        this.hashToState(window.location.hash);
    }
    hashToState(hash) {
        const { dataCubes } = this.state.appSettings;
        var viewType = this.getViewTypeFromHash(hash);
        var viewHash = this.getViewHashFromHash(hash);
        var newState = {
            viewType: viewType,
            viewHash: viewHash,
            drawerOpen: false
        };
        if (viewType === exports.CUBE) {
            var dataCube = this.getDataCubeFromHash(dataCubes, hash);
            if (!dataCube)
                dataCube = dataCubes[0];
            newState.selectedDataCube = dataCube;
        }
        else {
            newState.selectedDataCube = null;
        }
        this.setState(newState);
    }
    parseHash(hash) {
        if (hash[0] === '#')
            hash = hash.substr(1);
        return hash.split('/');
    }
    getViewTypeFromHash(hash) {
        const { readOnly } = this.props;
        const appSettings = this.state.appSettings || this.props.appSettings;
        var viewType = this.parseHash(hash)[0];
        if (!viewType || viewType === exports.HOME)
            return appSettings.linkViewConfig ? exports.LINK : exports.HOME;
        if (viewType === exports.SETTINGS)
            return readOnly ? exports.HOME : exports.SETTINGS;
        if (appSettings.linkViewConfig && viewType === exports.LINK)
            return exports.LINK;
        return exports.CUBE;
    }
    getDataCubeFromHash(dataCubes, hash) {
        // can change header from hash
        var parts = this.parseHash(hash);
        var dataCubeName = parts.shift();
        return plywood_1.helper.findByName(dataCubes, dataCubeName);
    }
    getViewHashFromHash(hash) {
        var parts = this.parseHash(hash);
        if (parts.length < 2)
            return null;
        parts.shift();
        return parts.join('/');
    }
    sideDrawerOpen(drawerOpen) {
        this.setState({ drawerOpen: drawerOpen });
    }
    changeHash(hash, force = false) {
        this.hashUpdating = true;
        // Hash initialization, no need to add the intermediary url in the history
        if (window.location.hash === `#${hash.split('/')[0]}`) {
            window.history.replaceState(undefined, undefined, `#${hash}`);
        }
        else {
            window.location.hash = `#${hash}`;
        }
        setTimeout(() => {
            this.hashUpdating = false;
        }, 5);
        if (force)
            this.hashToState(hash);
    }
    updateViewHash(viewHash, force = false) {
        var { viewType } = this.state;
        var newHash;
        if (viewType === exports.CUBE) {
            newHash = `${this.state.selectedDataCube.name}/${viewHash}`;
        }
        else if (viewType === exports.LINK) {
            newHash = `${viewType}/${viewHash}`;
        }
        else {
            newHash = viewType;
        }
        this.changeHash(newHash, force);
    }
    getUrlPrefix(baseOnly = false) {
        var { viewType } = this.state;
        var url = window.location;
        var urlBase = url.origin + url.pathname;
        if (baseOnly)
            return urlBase;
        var newPrefix;
        if (viewType === exports.CUBE) {
            newPrefix = `${this.state.selectedDataCube.name}/`;
        }
        else {
            newPrefix = viewType;
        }
        return urlBase + '#' + newPrefix;
    }
    openAboutModal() {
        this.setState({
            showAboutModal: true
        });
    }
    onAboutModalClose() {
        this.setState({
            showAboutModal: false
        });
    }
    onSettingsChange(newSettings) {
        this.setState({
            appSettings: newSettings
        });
    }
    renderAboutModal() {
        const { version } = this.props;
        const { AboutModalAsync, showAboutModal } = this.state;
        if (!AboutModalAsync || !showAboutModal)
            return null;
        return React.createElement(AboutModalAsync, {version: version, onClose: this.onAboutModalClose.bind(this)});
    }
    renderNotifications() {
        const { version } = this.props;
        const { NotificationsAsync } = this.state;
        if (!NotificationsAsync)
            return null;
        return React.createElement(NotificationsAsync, null);
    }
    render() {
        var { maxFilters, maxSplits, user, version } = this.props;
        var { viewType, viewHash, selectedDataCube, ReactCSSTransitionGroupAsync, drawerOpen, SideDrawerAsync, appSettings } = this.state;
        var { dataCubes, customization, linkViewConfig } = appSettings;
        var sideDrawer = null;
        if (drawerOpen && SideDrawerAsync) {
            var closeSideDrawer = this.sideDrawerOpen.bind(this, false);
            sideDrawer = React.createElement(SideDrawerAsync, {key: 'drawer', selectedDataCube: selectedDataCube, dataCubes: dataCubes, onOpenAbout: this.openAboutModal.bind(this), onClose: closeSideDrawer, customization: customization, itemHrefFn: this.sideBarHrefFn, isCube: viewType === exports.CUBE && !linkViewConfig, isLink: viewType === exports.LINK || !!linkViewConfig, isHome: viewType === exports.HOME});
        }
        if (ReactCSSTransitionGroupAsync) {
            var sideDrawerTransition = React.createElement(ReactCSSTransitionGroupAsync, {component: "div", className: "side-drawer-container", transitionName: "side-drawer", transitionEnterTimeout: 500, transitionLeaveTimeout: 300}, sideDrawer);
        }
        var view = null;
        switch (viewType) {
            case exports.HOME:
                view = React.createElement(home_view_1.HomeView, {user: user, dataCubes: dataCubes, onNavClick: this.sideDrawerOpen.bind(this, true), onOpenAbout: this.openAboutModal.bind(this), customization: customization});
                break;
            case exports.CUBE:
                view = React.createElement(cube_view_1.CubeView, {user: user, dataCube: selectedDataCube, hash: viewHash, updateViewHash: this.updateViewHash.bind(this), getUrlPrefix: this.getUrlPrefix.bind(this), maxFilters: maxFilters, maxSplits: maxSplits, onNavClick: this.sideDrawerOpen.bind(this, true), customization: customization, transitionFnSlot: this.sideBarHrefFn});
                break;
            case exports.LINK:
                view = React.createElement(link_view_1.LinkView, {user: user, linkViewConfig: linkViewConfig, hash: viewHash, updateViewHash: this.updateViewHash.bind(this), changeHash: this.changeHash.bind(this), getUrlPrefix: this.getUrlPrefix.bind(this), onNavClick: this.sideDrawerOpen.bind(this, true), customization: customization});
                break;
            case exports.SETTINGS:
                view = React.createElement(settings_view_1.SettingsView, {user: user, hash: window.location.hash, onNavClick: this.sideDrawerOpen.bind(this, true), onSettingsChange: this.onSettingsChange.bind(this), customization: customization, version: version});
                break;
            default:
                throw new Error('unknown view');
        }
        return React.createElement("main", {className: 'pivot-application'}, view, sideDrawerTransition, this.renderAboutModal(), this.renderNotifications());
    }
}
exports.PivotApplication = PivotApplication;
