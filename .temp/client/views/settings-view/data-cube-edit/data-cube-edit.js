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
require('./data-cube-edit.css');
const React = require('react');
const plywood_1 = require('plywood');
const dom_1 = require('../../../utils/dom/dom');
const chronoshift_1 = require('chronoshift');
const constants_1 = require('../../../config/constants');
const form_label_1 = require('../../../components/form-label/form-label');
const button_1 = require('../../../components/button/button');
const immutable_input_1 = require('../../../components/immutable-input/immutable-input');
const immutable_list_1 = require('../../../components/immutable-list/immutable-list');
const immutable_dropdown_1 = require('../../../components/immutable-dropdown/immutable-dropdown');
const dimension_modal_1 = require('../dimension-modal/dimension-modal');
const measure_modal_1 = require('../measure-modal/measure-modal');
const index_1 = require('../../../../common/models/index');
const labels_1 = require('../utils/labels');
class DataCubeEdit extends React.Component {
    constructor() {
        super();
        this.tabs = [
            { label: 'General', value: 'general', render: this.renderGeneral },
            { label: 'Attributes', value: 'attributes', render: this.renderAttributes },
            { label: 'Dimensions', value: 'dimensions', render: this.renderDimensions },
            { label: 'Measures', value: 'measures', render: this.renderMeasures }
        ];
        this.state = { hasChanged: false, errors: {} };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.settings) {
            this.initFromProps(nextProps);
        }
    }
    initFromProps(props) {
        let dataCube = props.settings.dataCubes.filter((d) => d.name === props.cubeId)[0];
        this.setState({
            myDataCube: new index_1.DataCube(dataCube.valueOf()),
            hasChanged: false,
            canSave: true,
            errors: {},
            dataCube: dataCube,
            tab: this.tabs.filter((tab) => tab.value === props.tab)[0]
        });
    }
    selectTab(tab) {
        var hash = window.location.hash.split('/');
        hash.splice(-1);
        window.location.hash = hash.join('/') + '/' + tab;
    }
    renderTabs(activeTab) {
        return this.tabs.map(({ label, value }) => {
            return React.createElement("button", {className: dom_1.classNames({ active: activeTab.value === value }), key: value, onClick: this.selectTab.bind(this, value)}, label);
        });
    }
    cancel() {
        this.setState({ myDataCube: undefined }, () => this.initFromProps(this.props));
    }
    save() {
        const { settings } = this.props;
        const { myDataCube, dataCube } = this.state;
        var newCubes = settings.dataCubes;
        newCubes[newCubes.indexOf(dataCube)] = myDataCube;
        var newSettings = settings.changeDataCubes(newCubes);
        if (this.props.onSave) {
            this.props.onSave(newSettings);
        }
    }
    goBack() {
        const { cubeId, tab } = this.props;
        var hash = window.location.hash;
        window.location.hash = hash.replace(`/${cubeId}/${tab}`, '');
    }
    onChange(newCube, isValid, path, error) {
        const { dataCube, errors } = this.state;
        errors[path] = isValid ? false : error;
        const hasChanged = !isValid || !dataCube.equals(newCube);
        var canSave = true;
        for (let key in errors)
            canSave = canSave && (errors[key] === false);
        if (isValid) {
            this.setState({
                myDataCube: newCube,
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
    getIntrospectionStrategies() {
        const labels = constants_1.DATA_CUBES_STRATEGIES_LABELS;
        return [{
                label: `Default (${labels[index_1.DataCube.DEFAULT_INTROSPECTION]})`,
                value: undefined
            }].concat(index_1.DataCube.INTROSPECTION_VALUES.map((value) => {
            return { value: value, label: labels[value] };
        }));
    }
    renderGeneral() {
        const { settings } = this.props;
        const { myDataCube, errors } = this.state;
        var makeLabel = form_label_1.FormLabel.simpleGenerator(labels_1.DATA_CUBE_EDIT, errors);
        var makeTextInput = immutable_input_1.ImmutableInput.simpleGenerator(myDataCube, this.onChange.bind(this));
        var makeDropDownInput = immutable_dropdown_1.ImmutableDropdown.simpleGenerator(myDataCube, this.onChange.bind(this));
        var possibleClusters = [
            { value: 'native', label: 'Load a file and serve it natively' }
        ].concat(settings.clusters.map((cluster) => {
            return { value: cluster.name, label: cluster.name };
        }));
        return React.createElement("form", {className: "general vertical"}, makeLabel('title'), makeTextInput('title', /^.+$/, true), makeLabel('description'), makeTextInput('description'), makeLabel('clusterName'), makeDropDownInput('clusterName', possibleClusters), makeLabel('introspection'), makeDropDownInput('introspection', this.getIntrospectionStrategies()), makeLabel('source'), makeTextInput('source'), makeLabel('subsetFormula'), makeTextInput('subsetFormula'), makeLabel('defaultDuration'), React.createElement(immutable_input_1.ImmutableInput, {instance: myDataCube, path: 'defaultDuration', onChange: this.onChange.bind(this), valueToString: (value) => value ? value.toJS() : undefined, stringToValue: (str) => str ? chronoshift_1.Duration.fromJS(str) : undefined}), makeLabel('defaultTimezone'), React.createElement(immutable_input_1.ImmutableInput, {instance: myDataCube, path: 'defaultTimezone', onChange: this.onChange.bind(this), valueToString: (value) => value ? value.toJS() : undefined, stringToValue: (str) => str ? chronoshift_1.Timezone.fromJS(str) : undefined}), makeLabel('defaultSortMeasure'), makeDropDownInput('defaultSortMeasure', myDataCube.measures.map(m => { return { value: m.name, label: m.title }; }).toArray()));
    }
    renderAttributes() {
        const { myDataCube, errors } = this.state;
        var makeLabel = form_label_1.FormLabel.simpleGenerator(labels_1.DATA_CUBE_EDIT, errors);
        return React.createElement("form", {className: "general vertical"}, makeLabel('attributeOverrides'), React.createElement(immutable_input_1.ImmutableInput, {instance: myDataCube, path: 'attributeOverrides', onChange: this.onChange.bind(this), valueToString: (value) => value ? JSON.stringify(plywood_1.AttributeInfo.toJSs(value), null, 2) : undefined, stringToValue: (str) => str ? plywood_1.AttributeInfo.fromJSs(JSON.parse(str)) : undefined, type: "textarea"}));
    }
    renderDimensions() {
        const { myDataCube } = this.state;
        const onChange = (newDimensions) => {
            const newCube = myDataCube.changeDimensions(newDimensions);
            this.setState({
                myDataCube: newCube,
                hasChanged: !this.state.dataCube.equals(newCube)
            });
        };
        const getModal = (item) => React.createElement(dimension_modal_1.DimensionModal, {dimension: item, dimensions: myDataCube.dimensions});
        const getNewItem = () => index_1.Dimension.fromJS({ name: 'new-dimension' });
        const getRows = (items) => items.toArray().map((dimension) => {
            return {
                title: dimension.title,
                description: dimension.expression.toString(),
                icon: `dim-${dimension.kind}`
            };
        });
        const DimensionsList = immutable_list_1.ImmutableList.specialize();
        return React.createElement(DimensionsList, {label: "Dimensions", items: myDataCube.dimensions, onChange: onChange.bind(this), getModal: getModal, getNewItem: getNewItem, getRows: getRows});
    }
    renderMeasures() {
        var { myDataCube } = this.state;
        const onChange = (newMeasures) => {
            var { defaultSortMeasure } = myDataCube;
            if (defaultSortMeasure) {
                if (!newMeasures.find((measure) => measure.name === defaultSortMeasure)) {
                    myDataCube = myDataCube.changeDefaultSortMeasure(newMeasures.get(0).name);
                }
            }
            const newCube = myDataCube.changeMeasures(newMeasures);
            this.setState({
                myDataCube: newCube,
                hasChanged: !this.state.dataCube.equals(newCube)
            });
        };
        const getModal = (item) => React.createElement(measure_modal_1.MeasureModal, {measure: item, measures: myDataCube.measures});
        const getNewItem = () => index_1.Measure.fromJS({ name: 'new-measure' });
        const getRows = (items) => items.toArray().map((measure) => {
            return {
                title: measure.title,
                description: measure.expression.toString(),
                icon: `measure`
            };
        });
        const MeasuresList = immutable_list_1.ImmutableList.specialize();
        return React.createElement(MeasuresList, {label: "Measures", items: myDataCube.measures, onChange: onChange.bind(this), getModal: getModal, getNewItem: getNewItem, getRows: getRows});
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
        const { myDataCube, tab, hasChanged, dataCube, canSave } = this.state;
        if (!myDataCube || !tab || !dataCube)
            return null;
        return React.createElement("div", {className: "data-cube-edit"}, React.createElement("div", {className: "title-bar"}, React.createElement(button_1.Button, {className: "button back", type: "secondary", svg: require('../../../icons/full-back.svg'), onClick: this.goBack.bind(this)}), React.createElement("div", {className: "title"}, dataCube.title), this.renderButtons()), React.createElement("div", {className: "content"}, React.createElement("div", {className: "tabs"}, this.renderTabs(tab)), React.createElement("div", {className: "tab-content"}, tab.render.bind(this)())));
    }
}
exports.DataCubeEdit = DataCubeEdit;
