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
require('./cluster-edit.css');
const React = require('react');
const dom_1 = require('../../../utils/dom/dom');
const form_label_1 = require('../../../components/form-label/form-label');
const button_1 = require('../../../components/button/button');
const immutable_input_1 = require('../../../components/immutable-input/immutable-input');
const immutable_dropdown_1 = require('../../../components/immutable-dropdown/immutable-dropdown');
const index_1 = require('../../../../common/models/index');
const labels_1 = require('../utils/labels');
// Shamelessly stolen from http://stackoverflow.com/a/10006499
// (well, traded for an upvote)
const IP_REGEX = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/;
const NUM_REGEX = /^\d+$/;
class ClusterEdit extends React.Component {
    constructor() {
        super();
        this.state = { hasChanged: false, canSave: true, errors: {} };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.settings) {
            this.initFromProps(nextProps);
        }
    }
    initFromProps(props) {
        let cluster = props.settings.clusters.filter((d) => d.name === props.clusterId)[0];
        this.setState({
            tempCluster: new index_1.Cluster(cluster.valueOf()),
            hasChanged: false,
            canSave: true,
            cluster: cluster,
            errors: {}
        });
    }
    cancel() {
        // Settings tempCluster to undefined resets the inputs
        this.setState({ tempCluster: undefined }, () => this.initFromProps(this.props));
    }
    save() {
        const { settings } = this.props;
        const { tempCluster, cluster } = this.state;
        var newClusters = settings.clusters;
        newClusters[newClusters.indexOf(cluster)] = tempCluster;
        var newSettings = settings.changeClusters(newClusters);
        if (this.props.onSave) {
            this.props.onSave(newSettings);
        }
    }
    goBack() {
        const { clusterId } = this.props;
        var hash = window.location.hash;
        window.location.hash = hash.replace(`/${clusterId}`, '');
    }
    onSimpleChange(newCluster, isValid, path, error) {
        const { cluster, errors } = this.state;
        errors[path] = isValid ? false : error;
        const hasChanged = !isValid || !cluster.equals(newCluster);
        var canSave = true;
        for (let key in errors)
            canSave = canSave && (errors[key] === false);
        if (isValid) {
            this.setState({
                tempCluster: newCluster,
                canSave: canSave,
                errors: errors,
                hasChanged: hasChanged
            });
        }
        else {
            this.setState({
                canSave: canSave,
                errors: errors,
                hasChanged: hasChanged
            });
        }
    }
    renderGeneral() {
        const { tempCluster, errors } = this.state;
        var makeLabel = form_label_1.FormLabel.simpleGenerator(labels_1.CLUSTER_EDIT, errors);
        var makeTextInput = immutable_input_1.ImmutableInput.simpleGenerator(tempCluster, this.onSimpleChange.bind(this));
        var makeDropDownInput = immutable_dropdown_1.ImmutableDropdown.simpleGenerator(tempCluster, this.onSimpleChange.bind(this));
        var isDruid = tempCluster.type === 'druid';
        var needsAuth = ['mysql', 'postgres'].indexOf(tempCluster.type) > -1;
        return React.createElement("form", {className: "general vertical"}, makeLabel('host'), makeTextInput('host', IP_REGEX, true), makeLabel('type'), makeDropDownInput('type', index_1.Cluster.TYPE_VALUES.map(type => { return { value: type, label: type }; })), makeLabel('timeout'), makeTextInput('timeout', NUM_REGEX), makeLabel('version'), makeTextInput('version'), makeLabel('sourceListScan'), makeDropDownInput('sourceListScan', [{ value: 'disable', label: 'Disable' }, { value: 'auto', label: 'Auto' }]), makeLabel('sourceListRefreshOnLoad'), makeDropDownInput('sourceListRefreshOnLoad', [{ value: true, label: 'Enabled' }, { value: false, label: 'Disabled' }]), makeLabel('sourceListRefreshInterval'), makeTextInput('sourceListRefreshInterval', NUM_REGEX), makeLabel('sourceReintrospectOnLoad'), makeDropDownInput('sourceReintrospectOnLoad', [{ value: true, label: 'Enabled' }, { value: false, label: 'Disabled' }]), makeLabel('sourceReintrospectInterval'), makeTextInput('sourceReintrospectInterval', NUM_REGEX), isDruid ? makeLabel('introspectionStrategy') : null, isDruid ? makeTextInput('introspectionStrategy') : null, needsAuth ? makeLabel('database') : null, needsAuth ? makeTextInput('database') : null, needsAuth ? makeLabel('user') : null, needsAuth ? makeTextInput('user') : null, needsAuth ? makeLabel('password') : null, needsAuth ? makeTextInput('password') : null);
    }
    renderButtons() {
        const { hasChanged, canSave } = this.state;
        const cancelButton = React.createElement(button_1.Button, {className: "cancel", title: "Revert changes", type: "secondary", onClick: this.cancel.bind(this)});
        const saveButton = React.createElement(button_1.Button, {className: dom_1.classNames("save", { disabled: !canSave || !hasChanged }), title: "Save", type: "primary", onClick: this.save.bind(this)});
        if (!hasChanged) {
            return React.createElement("div", {className: "button-group"}, saveButton);
        }
        return React.createElement("div", {className: "button-group"}, cancelButton, saveButton);
    }
    render() {
        const { tempCluster, hasChanged, canSave } = this.state;
        if (!tempCluster)
            return null;
        return React.createElement("div", {className: "cluster-edit"}, React.createElement("div", {className: "title-bar"}, React.createElement(button_1.Button, {className: "button back", type: "secondary", svg: require('../../../icons/full-back.svg'), onClick: this.goBack.bind(this)}), React.createElement("div", {className: "title"}, tempCluster.name), this.renderButtons()), React.createElement("div", {className: "content"}, this.renderGeneral()));
    }
}
exports.ClusterEdit = ClusterEdit;
