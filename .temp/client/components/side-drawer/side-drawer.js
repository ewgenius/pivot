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
require('./side-drawer.css');
const React = require('react');
const ReactDOM = require('react-dom');
const constants_1 = require('../../config/constants');
const dom_1 = require('../../utils/dom/dom');
const nav_logo_1 = require('../nav-logo/nav-logo');
const svg_icon_1 = require('../svg-icon/svg-icon');
const nav_list_1 = require('../nav-list/nav-list');
class SideDrawer extends React.Component {
    constructor() {
        super();
        this.globalMouseDownListener = this.globalMouseDownListener.bind(this);
        this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
    }
    componentDidMount() {
        window.addEventListener('mousedown', this.globalMouseDownListener);
        window.addEventListener('keydown', this.globalKeyDownListener);
    }
    componentWillUnmount() {
        window.removeEventListener('mousedown', this.globalMouseDownListener);
        window.removeEventListener('keydown', this.globalKeyDownListener);
    }
    globalMouseDownListener(e) {
        var myElement = ReactDOM.findDOMNode(this);
        var target = e.target;
        if (dom_1.isInside(target, myElement))
            return;
        this.props.onClose();
    }
    globalKeyDownListener(e) {
        if (!dom_1.escapeKey(e))
            return;
        this.props.onClose();
    }
    onHomeClick() {
        window.location.hash = '#';
    }
    renderOverviewLink() {
        const { isHome, isCube, isLink } = this.props;
        if (!isCube && !isLink && !isHome)
            return null;
        return React.createElement("div", {className: "home-container"}, React.createElement("div", {className: dom_1.classNames('home-link', { selected: isHome }), onClick: this.onHomeClick.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/home.svg')}), React.createElement("span", null, isCube || isHome ? 'Home' : 'Overview')));
    }
    render() {
        var { onClose, selectedDataCube, dataCubes, onOpenAbout, customization, itemHrefFn } = this.props;
        var navLinks = dataCubes.map(ds => {
            var href = (itemHrefFn && itemHrefFn(selectedDataCube, ds)) || ('#' + ds.name);
            return {
                name: ds.name,
                title: ds.title,
                tooltip: ds.description,
                href: href
            };
        });
        var infoAndFeedback = [{
                name: 'info',
                title: constants_1.STRINGS.infoAndFeedback,
                tooltip: 'Learn more about Pivot',
                onClick: () => {
                    onClose();
                    onOpenAbout();
                }
            }];
        var customLogoSvg = null;
        if (customization && customization.customLogoSvg) {
            customLogoSvg = customization.customLogoSvg;
        }
        return React.createElement("div", {className: "side-drawer"}, React.createElement(nav_logo_1.NavLogo, {customLogoSvg: customLogoSvg, onClick: onClose}), this.renderOverviewLink(), React.createElement(nav_list_1.NavList, {selected: selectedDataCube ? selectedDataCube.name : null, navLinks: navLinks, iconSvg: require('../../icons/full-cube.svg')}), React.createElement(nav_list_1.NavList, {navLinks: infoAndFeedback}));
    }
}
exports.SideDrawer = SideDrawer;
