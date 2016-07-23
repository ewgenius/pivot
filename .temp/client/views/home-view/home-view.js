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
require('./home-view.css');
const React = require('react');
const constants_1 = require('../../config/constants');
const home_header_bar_1 = require('../../components/home-header-bar/home-header-bar');
const item_card_1 = require('./item-card/item-card');
class HomeView extends React.Component {
    goToCube(cube) {
        window.location.hash = '#' + cube.name;
    }
    renderCube(cube) {
        return React.createElement(item_card_1.ItemCard, {key: cube.name, title: cube.title, description: cube.description, icon: "full-cube", onClick: this.goToCube.bind(this, cube)});
    }
    renderCubes(cubes) {
        return React.createElement("div", {className: "datacubes"}, React.createElement("div", {className: "title"}, constants_1.STRINGS.dataCubes), React.createElement("div", {className: "cubes-container"}, cubes.map(this.renderCube, this), React.createElement("div", {className: "item-card empty"}), React.createElement("div", {className: "item-card empty"}), React.createElement("div", {className: "item-card empty"}), React.createElement("div", {className: "item-card empty"})));
    }
    render() {
        const { user, dataCubes, onNavClick, onOpenAbout, customization } = this.props;
        return React.createElement("div", {className: "home-view"}, React.createElement(home_header_bar_1.HomeHeaderBar, {user: user, onNavClick: onNavClick, customization: customization, title: constants_1.STRINGS.home}, React.createElement("button", {className: "text-button", onClick: onOpenAbout}, constants_1.STRINGS.infoAndFeedback)), React.createElement("div", {className: "container"}, this.renderCubes(dataCubes)));
    }
}
exports.HomeView = HomeView;
