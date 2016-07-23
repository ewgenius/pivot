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
require('./general.css');
const chronoshift_1 = require('chronoshift');
const React = require('react');
const form_label_1 = require('../../../components/form-label/form-label');
const button_1 = require('../../../components/button/button');
const immutable_input_1 = require('../../../components/immutable-input/immutable-input');
const labels_1 = require('../utils/labels');
class General extends React.Component {
    constructor() {
        super();
        this.state = { hasChanged: false, errors: {} };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.settings)
            this.setState({
                newSettings: nextProps.settings,
                hasChanged: false,
                errors: {}
            });
    }
    onChange(newSettings, isValid, path) {
        const { errors } = this.state;
        const settings = this.props.settings;
        errors[path] = !isValid;
        this.setState({
            newSettings: newSettings,
            errors: errors,
            hasChanged: !settings.equals(newSettings)
        });
    }
    save() {
        if (this.props.onSave) {
            this.props.onSave(this.state.newSettings);
        }
    }
    parseTimezones(str) {
        return str.split(/\s*,\s*/)
            .map(chronoshift_1.Timezone.fromJS);
    }
    render() {
        const { hasChanged, newSettings, errors } = this.state;
        if (!newSettings)
            return null;
        return React.createElement("div", {className: "general"}, React.createElement("div", {className: "title-bar"}, React.createElement("div", {className: "title"}, "General"), hasChanged ? React.createElement(button_1.Button, {className: "save", title: "Save", type: "primary", onClick: this.save.bind(this)}) : null), React.createElement("div", {className: "content"}, React.createElement("form", {className: "vertical"}, React.createElement(form_label_1.FormLabel, {label: "Browser title", helpText: labels_1.GENERAL.title.help, errorText: errors['customization.title'] ? labels_1.GENERAL.title.error : undefined}), React.createElement(immutable_input_1.ImmutableInput, {instance: newSettings, path: 'customization.title', onChange: this.onChange.bind(this), focusOnStartUp: true}), React.createElement(form_label_1.FormLabel, {label: "Timezones", helpText: labels_1.GENERAL.timezones.help, errorText: errors.timezones ? labels_1.GENERAL.timezones.error : undefined}), React.createElement(immutable_input_1.ImmutableInput, {instance: newSettings, path: 'customization.timezones', onChange: this.onChange.bind(this), valueToString: (value) => value ? value.join(', ') : undefined, stringToValue: this.parseTimezones.bind(this)}))));
    }
}
exports.General = General;
