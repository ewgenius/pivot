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
require('./immutable-input.css');
const React = require('react');
const ReactDOM = require('react-dom');
const index_1 = require('../../../common/utils/index');
const dom_1 = require('../../utils/dom/dom');
class ImmutableInput extends React.Component {
    constructor() {
        super();
        this.focusAlreadyGiven = false;
        this.state = {};
    }
    static simpleGenerator(instance, changeFn) {
        return (name, validator = /^.+$/, focusOnStartUp = false) => {
            return React.createElement(ImmutableInput, {instance: instance, path: name, onChange: changeFn, focusOnStartUp: focusOnStartUp, validator: validator});
        };
    }
    ;
    initFromProps(props) {
        if (!props.instance || !props.path)
            return;
        var validString;
        if (this.state.validString === undefined) {
            validString = props.valueToString(index_1.ImmutableUtils.getProperty(props.instance, props.path));
        }
        else {
            var currentCanonical = props.valueToString(props.stringToValue(this.state.validString));
            var possibleCanonical = props.valueToString(index_1.ImmutableUtils.getProperty(props.instance, props.path));
            validString = currentCanonical === possibleCanonical ? this.state.validString : possibleCanonical;
        }
        this.setState({
            myInstance: props.instance,
            invalidString: undefined,
            validString: validString
        });
    }
    reset() {
        this.setState({
            invalidString: undefined,
            validString: undefined
        });
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.instance === undefined) {
            this.reset();
        }
        if (this.state.invalidString === undefined && nextProps.instance !== this.state.myInstance) {
            this.initFromProps(nextProps);
        }
    }
    componentDidUpdate() {
        this.maybeFocus();
    }
    componentDidMount() {
        this.initFromProps(this.props);
        this.maybeFocus();
    }
    maybeFocus() {
        if (!this.focusAlreadyGiven && this.props.focusOnStartUp && this.refs['me']) {
            ReactDOM.findDOMNode(this.refs['me']).focus();
            this.focusAlreadyGiven = true;
        }
    }
    isValueValid(value) {
        var { validator } = this.props;
        if (!validator)
            return true;
        if (validator instanceof RegExp) {
            return validator.test(value);
        }
        if (validator instanceof Function) {
            return !!validator(value);
        }
        return true;
    }
    onChange(event) {
        const { path, onChange, instance, validator, onInvalid, stringToValue } = this.props;
        var newString = event.target.value;
        var myInstance;
        var invalidString;
        var validString;
        var error = '';
        try {
            var newValue = stringToValue ? stringToValue(newString) : newString;
            if (validator && !this.isValueValid(newString)) {
                myInstance = instance;
                invalidString = newString;
                if (onInvalid)
                    onInvalid(newValue);
            }
            else {
                myInstance = index_1.ImmutableUtils.setProperty(instance, path, newValue);
                validString = newString;
            }
        }
        catch (e) {
            myInstance = instance;
            invalidString = newString;
            error = e.message;
            if (onInvalid)
                onInvalid(newValue);
        }
        this.setState({ myInstance: myInstance, invalidString: invalidString, validString: validString }, () => {
            if (onChange)
                onChange(myInstance, invalidString === undefined, path, error);
        });
    }
    render() {
        const { path, valueToString, type } = this.props;
        const { myInstance, invalidString, validString } = this.state;
        const isInvalid = invalidString !== undefined;
        if (!path || !myInstance)
            return null;
        if (type === 'textarea') {
            return React.createElement("textarea", {className: dom_1.classNames('immutable-input', { error: isInvalid }), ref: 'me', type: "text", value: (isInvalid ? invalidString : validString) || '', onChange: this.onChange.bind(this)});
        }
        return React.createElement("input", {className: dom_1.classNames('immutable-input', { error: isInvalid }), ref: 'me', type: "text", value: (isInvalid ? invalidString : validString) || '', onChange: this.onChange.bind(this)});
    }
}
ImmutableInput.defaultProps = {
    type: 'text',
    stringToValue: String,
    valueToString: (value) => value ? String(value) : ''
};
exports.ImmutableInput = ImmutableInput;
