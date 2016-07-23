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
require('./immutable-dropdown.css');
const index_1 = require('../../../common/utils/index');
const React = require('react');
const dropdown_1 = require('../dropdown/dropdown');
class ImmutableDropdown extends React.Component {
    constructor() {
        super();
    }
    // Allows usage in TSX :
    // const MyDropdown = ImmutableDropdown.specialize<MyImmutableClass>();
    // then : <MyDropdown ... />
    static specialize() {
        return ImmutableDropdown;
    }
    static simpleGenerator(instance, changeFn) {
        return (name, items) => {
            let MyDropDown = ImmutableDropdown.specialize();
            return React.createElement(MyDropDown, {items: items, instance: instance, path: name, equal: (a, b) => a.value === b.value, renderItem: (a) => a.label, keyItem: (a) => a.value || 'default_value', onChange: changeFn});
        };
    }
    onChange(newSelectedItem) {
        const { instance, path, onChange, keyItem } = this.props;
        onChange(index_1.ImmutableUtils.setProperty(instance, path, keyItem(newSelectedItem)), true, path);
    }
    render() {
        const { label, items, equal, renderItem, keyItem, instance, path } = this.props;
        const MyDropDown = dropdown_1.Dropdown.specialize();
        const selectedValue = index_1.ImmutableUtils.getProperty(instance, path);
        const selectedItem = items.filter((item) => keyItem(item) === selectedValue)[0] || items[0];
        return React.createElement(MyDropDown, {className: "immutable-dropdown input", label: label, items: items, selectedItem: selectedItem, equal: equal, renderItem: renderItem, keyItem: keyItem, onSelect: this.onChange.bind(this)});
    }
}
exports.ImmutableDropdown = ImmutableDropdown;
