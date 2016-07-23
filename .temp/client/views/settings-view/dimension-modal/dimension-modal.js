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
require('./dimension-modal.css');
const React = require('react');
const dom_1 = require('../../../utils/dom/dom');
const form_label_1 = require('../../../components/form-label/form-label');
const button_1 = require('../../../components/button/button');
const immutable_input_1 = require('../../../components/immutable-input/immutable-input');
const modal_1 = require('../../../components/modal/modal');
const immutable_dropdown_1 = require('../../../components/immutable-dropdown/immutable-dropdown');
const index_1 = require('../../../../common/models/index');
const labels_1 = require('../utils/labels');
class DimensionModal extends React.Component {
    constructor() {
        super();
        this.state = {
            canSave: false,
            errors: {}
        };
    }
    initStateFromProps(props) {
        if (props.dimension) {
            this.setState({
                newDimension: new index_1.Dimension(props.dimension.valueOf()),
                canSave: false,
                errors: {}
            });
        }
    }
    componentWillReceiveProps(nextProps) {
        this.initStateFromProps(nextProps);
    }
    componentDidMount() {
        this.initStateFromProps(this.props);
    }
    onChange(newDimension, isValid, path, error) {
        var { errors } = this.state;
        errors[path] = isValid ? false : error;
        var canSave = true;
        for (let key in errors)
            canSave = canSave && (errors[key] === false);
        if (isValid) {
            this.setState({
                newDimension: newDimension,
                errors: errors,
                canSave: canSave && !this.props.dimension.equals(newDimension)
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
        this.props.onSave(this.state.newDimension);
    }
    uniqueName(name) {
        const { dimensions } = this.props;
        if (dimensions.find((m) => m.name === name)) {
            throw new Error(`Another dimension with this name already exists`);
        }
        return true;
    }
    render() {
        const { isCreating, dimension } = this.props;
        const { newDimension, canSave, errors } = this.state;
        if (!newDimension)
            return null;
        const isTime = newDimension.kind === 'time';
        var makeLabel = form_label_1.FormLabel.simpleGenerator(labels_1.DIMENSION_EDIT, errors, true);
        var makeTextInput = immutable_input_1.ImmutableInput.simpleGenerator(newDimension, this.onChange.bind(this));
        var makeDropDownInput = immutable_dropdown_1.ImmutableDropdown.simpleGenerator(newDimension, this.onChange.bind(this));
        return React.createElement(modal_1.Modal, {className: "dimension-modal", title: dimension.title, onClose: this.props.onClose, onEnter: this.save.bind(this)}, React.createElement("form", {className: "general vertical"}, isCreating ? makeLabel('name') : null, isCreating ? makeTextInput('name', this.uniqueName.bind(this), isCreating) : null, makeLabel('title'), makeTextInput('title', /^.+$/, !isCreating), makeLabel('kind'), makeDropDownInput('kind', DimensionModal.KINDS), makeLabel('formula'), makeTextInput('formula'), makeLabel('url'), makeTextInput('url'), isTime ? makeLabel('granularities') : null, isTime ? React.createElement(immutable_input_1.ImmutableInput, {instance: newDimension, path: 'granularities', onChange: this.onChange.bind(this), valueToString: (value) => value ? value.map(index_1.granularityToString).join(', ') : undefined, stringToValue: (str) => str.split(/\s*,\s*/).map(index_1.granularityFromJS)}) : null), React.createElement("div", {className: "button-group"}, React.createElement(button_1.Button, {className: dom_1.classNames("save", { disabled: !canSave }), title: "Save", type: "primary", onClick: this.save.bind(this)}), React.createElement(button_1.Button, {className: "cancel", title: "Cancel", type: "secondary", onClick: this.props.onClose})));
    }
}
DimensionModal.KINDS = [
    { label: 'Time', value: 'time' },
    { label: 'String', value: 'string' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'String-geo', value: 'string-geo' }
];
exports.DimensionModal = DimensionModal;
