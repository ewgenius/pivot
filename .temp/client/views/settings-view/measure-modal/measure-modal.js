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
require('./measure-modal.css');
const React = require('react');
const dom_1 = require('../../../utils/dom/dom');
const form_label_1 = require('../../../components/form-label/form-label');
const button_1 = require('../../../components/button/button');
const immutable_input_1 = require('../../../components/immutable-input/immutable-input');
const immutable_dropdown_1 = require('../../../components/immutable-dropdown/immutable-dropdown');
const modal_1 = require('../../../components/modal/modal');
const index_1 = require('../../../../common/models/index');
const labels_1 = require('../utils/labels');
class MeasureModal extends React.Component {
    constructor() {
        super();
        this.hasInitialized = false;
        this.state = {
            canSave: false,
            errors: {}
        };
    }
    initStateFromProps(props) {
        if (props.measure) {
            this.setState({
                newMeasure: new index_1.Measure(props.measure.valueOf()),
                canSave: false
            });
        }
    }
    componentWillReceiveProps(nextProps) {
        this.initStateFromProps(nextProps);
    }
    componentDidMount() {
        this.initStateFromProps(this.props);
    }
    componentDidUpdate() {
        if (!this.hasInitialized && !!this.refs['name-input']) {
            this.refs['name-input'].focus();
            this.hasInitialized = true;
        }
    }
    onChange(newMeasure, isValid, path, error) {
        var { errors } = this.state;
        errors[path] = isValid ? false : error;
        var canSave = true;
        for (let key in errors)
            canSave = canSave && (errors[key] === false);
        if (isValid) {
            this.setState({
                errors: errors,
                newMeasure: newMeasure,
                canSave: canSave && !this.props.measure.equals(newMeasure)
            });
        }
        else {
            this.setState({
                errors: errors,
                canSave: false
            });
        }
    }
    save() {
        if (!this.state.canSave)
            return;
        this.props.onSave(this.state.newMeasure);
    }
    uniqueName(name) {
        const { measures } = this.props;
        if (measures.find((m) => m.name === name)) {
            throw new Error(`Another measure with this name already exists`);
        }
        return true;
    }
    render() {
        const { isCreating, measure } = this.props;
        const { newMeasure, canSave, errors } = this.state;
        if (!newMeasure)
            return null;
        var makeLabel = form_label_1.FormLabel.simpleGenerator(labels_1.MEASURE_EDIT, errors, true);
        var makeTextInput = immutable_input_1.ImmutableInput.simpleGenerator(newMeasure, this.onChange.bind(this));
        var makeDropDownInput = immutable_dropdown_1.ImmutableDropdown.simpleGenerator(newMeasure, this.onChange.bind(this));
        return React.createElement(modal_1.Modal, {className: "dimension-modal", title: measure.title, onClose: this.props.onClose, onEnter: this.save.bind(this)}, React.createElement("form", {className: "general vertical"}, isCreating ? makeLabel('name') : null, isCreating ? makeTextInput('name', this.uniqueName.bind(this), isCreating) : null, makeLabel('title'), makeTextInput('title', /^.+$/, !isCreating), makeLabel('formula'), makeTextInput('formula')), React.createElement("div", {className: "button-group"}, React.createElement(button_1.Button, {className: dom_1.classNames("save", { disabled: !canSave }), title: "Save", type: "primary", onClick: this.save.bind(this)}), React.createElement(button_1.Button, {className: "cancel", title: "Cancel", type: "secondary", onClick: this.props.onClose})));
    }
}
exports.MeasureModal = MeasureModal;
