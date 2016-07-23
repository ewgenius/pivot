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
require('./data-cubes.css');
const React = require('react');
const button_1 = require('../../../components/button/button');
const index_1 = require('../../../../common/models/index');
const simple_table_1 = require('../../../components/simple-table/simple-table');
const remove_modal_1 = require('../remove-modal/remove-modal');
class DataCubes extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.settings)
            this.setState({
                newSettings: nextProps.settings,
                hasChanged: false,
                pendingDeletion: undefined
            });
    }
    editCube(cube) {
        window.location.hash += `/${cube.name}`;
    }
    askForCubeRemoval(cube) {
        this.setState({ pendingDeletion: cube });
    }
    cancelRemoval() {
        this.setState({ pendingDeletion: undefined });
    }
    removeCube() {
        var cube = this.state.pendingDeletion;
        var settings = this.state.newSettings;
        var index = settings.dataCubes.indexOf(cube);
        if (index < 0)
            return;
        var newCubes = settings.dataCubes;
        newCubes.splice(index, 1);
        this.props.onSave(settings.changeDataCubes(newCubes), 'Cube removed');
    }
    createCube() {
        var settings = this.state.newSettings;
        var newCube = index_1.DataCube.fromJS({
            name: 'new-datacube',
            clusterName: settings.clusters.length > 0 ? settings.clusters[0].name : 'native',
            source: 'new-source'
        });
        this.props.onSave(settings.addDataCube(newCube), 'Cube added');
    }
    renderEmpty() {
        return React.createElement("div", {className: "data-cubes empty"}, React.createElement("div", {className: "title"}, "No data cubes"), React.createElement("div", {className: "subtitle actionable", onClick: this.createCube.bind(this)}, "Create a new data cube"));
    }
    render() {
        const { newSettings, pendingDeletion } = this.state;
        if (!newSettings)
            return null;
        if (!newSettings.dataCubes.length)
            return this.renderEmpty();
        const columns = [
            { label: 'Name', field: 'title', width: 170, cellIcon: 'full-cube' },
            { label: 'Source', field: 'source', width: 400 },
            { label: 'Dimensions', field: (cube) => cube.dimensions.size, width: 120 },
            { label: 'Measures', field: (cube) => cube.measures.size, width: 80 }
        ];
        const actions = [
            { icon: 'full-edit', callback: this.editCube.bind(this) },
            { icon: 'full-remove', callback: this.askForCubeRemoval.bind(this) }
        ];
        return React.createElement("div", {className: "data-cubes"}, React.createElement("div", {className: "title-bar"}, React.createElement("div", {className: "title"}, "Data Cubes"), React.createElement(button_1.Button, {className: "save", title: "Add a cube", type: "primary", onClick: this.createCube.bind(this)})), React.createElement("div", {className: "content"}, React.createElement(simple_table_1.SimpleTable, {columns: columns, rows: newSettings.dataCubes, actions: actions, onRowClick: this.editCube.bind(this)})), pendingDeletion ? React.createElement(remove_modal_1.RemoveModal, {itemTitle: pendingDeletion.title, onOK: this.removeCube.bind(this), onCancel: this.cancelRemoval.bind(this)}) : null);
    }
}
exports.DataCubes = DataCubes;
