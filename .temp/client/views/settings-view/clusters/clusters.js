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
require('./clusters.css');
const React = require('react');
const button_1 = require('../../../components/button/button');
const simple_table_1 = require('../../../components/simple-table/simple-table');
class Clusters extends React.Component {
    constructor() {
        super();
        this.state = { hasChanged: false };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.settings)
            this.setState({
                newSettings: nextProps.settings,
                hasChanged: false
            });
    }
    save() {
        if (this.props.onSave) {
            this.props.onSave(this.state.newSettings);
        }
    }
    editCluster(cluster) {
        window.location.hash += `/${cluster.name}`;
    }
    renderEmpty() {
        return React.createElement("div", {className: "clusters empty"}, React.createElement("div", {className: "title"}, "No clusters"), React.createElement("div", {className: "subtitle"}, "(the only data cube type available is 'native')"));
    }
    render() {
        const { hasChanged, newSettings } = this.state;
        if (!newSettings)
            return null;
        if (!newSettings.clusters.length)
            return this.renderEmpty();
        const columns = [
            { label: 'Name', field: 'name', width: 200, cellIcon: 'full-cluster' },
            { label: 'Host', field: 'host', width: 200 },
            { label: 'Strategy', field: 'introspectionStrategy', width: 300 }
        ];
        const actions = [
            { icon: 'full-edit', callback: this.editCluster.bind(this) }
        ];
        return React.createElement("div", {className: "clusters"}, React.createElement("div", {className: "title-bar"}, React.createElement("div", {className: "title"}, "Clusters"), hasChanged ? React.createElement(button_1.Button, {className: "save", title: "Save", type: "primary", onClick: this.save.bind(this)}) : null), React.createElement("div", {className: "content"}, React.createElement(simple_table_1.SimpleTable, {columns: columns, rows: newSettings.clusters, actions: actions, onRowClick: this.editCluster.bind(this)})));
    }
}
exports.Clusters = Clusters;
