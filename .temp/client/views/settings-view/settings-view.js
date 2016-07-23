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
require('./settings-view.css');
const React = require('react');
const Qajax = require('qajax');
const index_1 = require('../../../common/manifests/index');
const constants_1 = require('../../config/constants');
const ajax_1 = require('../../utils/ajax/ajax');
const dom_1 = require('../../utils/dom/dom');
const notifications_1 = require('../../components/notifications/notifications');
const home_header_bar_1 = require('../../components/home-header-bar/home-header-bar');
const button_1 = require('../../components/button/button');
const router_1 = require('../../components/router/router');
const index_2 = require('../../../common/models/index');
const general_1 = require('./general/general');
const clusters_1 = require('./clusters/clusters');
const cluster_edit_1 = require('./cluster-edit/cluster-edit');
const data_cubes_1 = require('./data-cubes/data-cubes');
const data_cube_edit_1 = require('./data-cube-edit/data-cube-edit');
const VIEWS = [
    { label: 'General', value: 'general', svg: require('../../icons/full-settings.svg') },
    { label: 'Clusters', value: 'clusters', svg: require('../../icons/full-cluster.svg') },
    { label: 'Data Cubes', value: 'data_cubes', svg: require('../../icons/full-cube.svg') }
];
class SettingsView extends React.Component {
    constructor() {
        super();
        this.state = {
            errorText: '',
            messageText: 'Welcome to the world of settings!'
        };
    }
    componentDidMount() {
        this.mounted = true;
        Qajax({ method: "GET", url: 'settings' })
            .then(Qajax.filterSuccess)
            .then(Qajax.toJSON)
            .then((resp) => {
            if (!this.mounted)
                return;
            this.setState({
                errorText: '',
                messageText: '',
                settings: index_2.AppSettings.fromJS(resp.appSettings, { visualizations: index_1.MANIFESTS })
            });
        }, (xhr) => {
            if (!this.mounted)
                return;
            var jsonError = JSON.parse(xhr.responseText);
            this.setState({
                errorText: `Server error: ${jsonError}`,
                messageText: ''
            });
        }).done();
    }
    componentWillUnmount() {
        this.mounted = false;
    }
    onSave(settings, okMessage) {
        const { version, onSettingsChange } = this.props;
        Qajax({
            method: "POST",
            url: 'settings',
            data: {
                version: version,
                appSettings: settings
            }
        })
            .then(Qajax.filterSuccess)
            .then(Qajax.toJSON)
            .then((status) => {
            if (!this.mounted)
                return;
            this.setState({ settings: settings });
            notifications_1.Notifier.success(okMessage ? okMessage : 'Settings saved');
            if (onSettingsChange) {
                onSettingsChange(settings.toClientSettings().attachExecutors((dataCube) => {
                    return ajax_1.queryUrlExecutorFactory(dataCube.name, 'plywood', version);
                }));
            }
        }, (xhr) => {
            if (!this.mounted)
                return;
            notifications_1.Notifier.failure('Woops', 'Something bad happened');
        }).done();
    }
    selectTab(value) {
        window.location.hash = `settings/${value}`;
    }
    renderLeftButtons(breadCrumbs) {
        if (!breadCrumbs || !breadCrumbs.length)
            return [];
        return VIEWS.map(({ label, value, svg }) => {
            return React.createElement(button_1.Button, {className: dom_1.classNames({ active: breadCrumbs[0] === value }), title: label, type: "primary", svg: svg, key: value, onClick: this.selectTab.bind(this, value)});
        });
    }
    onURLChange(breadCrumbs) {
        this.setState({ breadCrumbs: breadCrumbs });
    }
    render() {
        const { user, onNavClick, customization, hash } = this.props;
        const { errorText, messageText, settings, breadCrumbs } = this.state;
        return React.createElement("div", {className: "settings-view"}, React.createElement(home_header_bar_1.HomeHeaderBar, {user: user, onNavClick: onNavClick, customization: customization, title: constants_1.STRINGS.settings}), React.createElement("div", {className: "left-panel"}, this.renderLeftButtons(breadCrumbs)), React.createElement("div", {className: "main-panel"}, React.createElement(router_1.Router, {onURLChange: this.onURLChange.bind(this), rootFragment: "settings", hash: hash}, React.createElement(router_1.Route, {fragment: "general"}, React.createElement(general_1.General, {settings: settings, onSave: this.onSave.bind(this)})), React.createElement(router_1.Route, {fragment: "clusters"}, React.createElement(clusters_1.Clusters, {settings: settings, onSave: this.onSave.bind(this)}), React.createElement(router_1.Route, {fragment: ":clusterId"}, React.createElement(cluster_edit_1.ClusterEdit, {settings: settings, onSave: this.onSave.bind(this)}))), React.createElement(router_1.Route, {fragment: "data_cubes"}, React.createElement(data_cubes_1.DataCubes, {settings: settings, onSave: this.onSave.bind(this)}), React.createElement(router_1.Route, {fragment: ":cubeId/:tab=general"}, React.createElement(data_cube_edit_1.DataCubeEdit, {settings: settings, onSave: this.onSave.bind(this)}))))));
    }
}
exports.SettingsView = SettingsView;
