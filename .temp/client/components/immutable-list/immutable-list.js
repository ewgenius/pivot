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
require('./immutable-list.css');
const React = require('react');
const simple_list_1 = require('../simple-list/simple-list');
class ImmutableList extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    // Allows usage in TSX :
    // const MyList = ImmutableList.specialize<MyImmutableClass>();
    // then : <MyList ... />
    static specialize() {
        return ImmutableList;
    }
    editItem(index) {
        this.setState({ editedIndex: index });
    }
    addItem() {
        this.setState({ pendingAddItem: this.props.getNewItem() });
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.items) {
            this.setState({ tempItems: nextProps.items });
        }
    }
    componentDidMount() {
        if (this.props.items) {
            this.setState({ tempItems: this.props.items });
        }
    }
    deleteItem(index) {
        const { tempItems } = this.state;
        this.setState({ tempItems: tempItems.delete(index) }, this.onChange);
    }
    onChange() {
        this.props.onChange(this.state.tempItems);
    }
    renderEditModal(itemIndex) {
        const { tempItems } = this.state;
        var item = tempItems.get(itemIndex);
        var onSave = (newItem) => {
            const newItems = tempItems.update(itemIndex, () => newItem);
            this.setState({ tempItems: newItems, editedIndex: undefined }, this.onChange);
        };
        var onClose = () => this.setState({ editedIndex: undefined });
        return React.cloneElement(this.props.getModal(item), { onSave: onSave, onClose: onClose });
    }
    renderAddModal(item) {
        var onSave = (newItem) => {
            const { tempItems } = this.state;
            const newItems = tempItems.push(newItem);
            this.setState({ tempItems: newItems, pendingAddItem: null }, this.onChange);
        };
        var onClose = () => this.setState({ pendingAddItem: null });
        return React.cloneElement(this.props.getModal(item), { onSave: onSave, onClose: onClose, isCreating: true });
    }
    render() {
        const { items, getRows, label } = this.props;
        const { editedIndex, pendingAddItem } = this.state;
        if (!items)
            return null;
        return React.createElement("div", {className: "immutable-list"}, React.createElement("div", {className: "list-title"}, React.createElement("div", {className: "label"}, label), React.createElement("div", {className: "actions"}, React.createElement("button", {onClick: this.addItem.bind(this)}, "Add item"))), React.createElement(simple_list_1.SimpleList, {rows: getRows(items), onEdit: this.editItem.bind(this), onRemove: this.deleteItem.bind(this)}), editedIndex !== undefined ? this.renderEditModal(editedIndex) : null, pendingAddItem ? this.renderAddModal(pendingAddItem) : null);
    }
}
exports.ImmutableList = ImmutableList;
