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
const chai_1 = require('chai');
const sinon = require('sinon');
const React = require('react');
const TestUtils = require('react-addons-test-utils');
const mocks_1 = require('../../../common/models/mocks');
const index_1 = require('../../../common/models/index');
const index_2 = require('../../utils/test-utils/index');
const immutable_dropdown_1 = require('./immutable-dropdown');
describe('ImmutableDropdown', () => {
    var component;
    var node;
    var onChange;
    beforeEach(() => {
        onChange = sinon.spy();
        var MyDropdown = immutable_dropdown_1.ImmutableDropdown.specialize();
        const clusterNames = index_1.Cluster.TYPE_VALUES.map(type => { return { value: type, label: type }; });
        component = TestUtils.renderIntoDocument(React.createElement(MyDropdown, {instance: mocks_1.DataCubeMock.twitter(), path: 'clusterName', label: "Cluster", onChange: onChange, items: clusterNames, equal: (a, b) => a.value === b.value, renderItem: (a) => a.label, keyItem: (a) => a.value}));
        node = index_2.findDOMNode(component);
    });
    it('adds the correct class', () => {
        chai_1.expect(TestUtils.isCompositeComponent(component), 'should be composite').to.equal(true);
        chai_1.expect(node.className, 'should contain class').to.contain('immutable-dropdown');
    });
    it('selects an item and calls onChange', () => {
        chai_1.expect(onChange.callCount).to.equal(0);
        TestUtils.Simulate.click(node);
        var items = TestUtils.scryRenderedDOMComponentsWithClass(component, 'dropdown-item');
        TestUtils.Simulate.click(items[1]);
        chai_1.expect(onChange.callCount).to.equal(1);
        const args = onChange.args[0];
        chai_1.expect(args[0]).to.be.instanceOf(index_1.DataCube);
        chai_1.expect(args[0].clusterName).to.equal(index_1.Cluster.TYPE_VALUES[1]);
        chai_1.expect(args[1]).to.equal(true);
        chai_1.expect(args[2]).to.equal('clusterName');
    });
});
