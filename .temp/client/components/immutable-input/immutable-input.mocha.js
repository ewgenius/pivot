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
const index_1 = require('../../../common/models/index');
const mocks_1 = require('../../../common/models/mocks');
const index_2 = require('../../utils/test-utils/index');
const immutable_input_1 = require('./immutable-input');
describe('ImmutableInput', () => {
    var component;
    var node;
    var onChange;
    var onInvalid;
    beforeEach(() => {
        onChange = sinon.spy();
        onInvalid = sinon.spy();
        component = TestUtils.renderIntoDocument(React.createElement(immutable_input_1.ImmutableInput, {instance: mocks_1.DataCubeMock.twitter(), path: 'clusterName', validator: /^.+$/, onChange: onChange, onInvalid: onInvalid}));
        node = index_2.findDOMNode(component);
    });
    it('adds the correct class', () => {
        chai_1.expect(TestUtils.isCompositeComponent(component), 'should be composite').to.equal(true);
        chai_1.expect(node.className, 'should contain class').to.contain('immutable-input');
    });
    it('works for valid values', () => {
        node.value = 'giraffe';
        TestUtils.Simulate.change(node);
        chai_1.expect(onInvalid.callCount).to.equal(0);
        chai_1.expect(onChange.callCount).to.equal(1);
        const args = onChange.args[0];
        chai_1.expect(args[0]).to.be.instanceOf(index_1.DataCube);
        chai_1.expect(args[0].clusterName).to.equal('giraffe');
        chai_1.expect(args[1]).to.equal(true);
        chai_1.expect(args[2]).to.equal('clusterName');
    });
    it('works for invalid values', () => {
        node.value = '';
        TestUtils.Simulate.change(node);
        chai_1.expect(onInvalid.callCount).to.equal(1);
        chai_1.expect(onInvalid.args[0][0]).to.equal('');
        chai_1.expect(onChange.callCount).to.equal(1);
        var args = onChange.args[0];
        chai_1.expect(args[0]).to.be.instanceOf(index_1.DataCube);
        chai_1.expect(args[0].clusterName).to.equal(mocks_1.DataCubeMock.twitter().clusterName);
        chai_1.expect(args[1]).to.equal(false);
        chai_1.expect(args[2]).to.equal('clusterName');
        chai_1.expect(node.value).to.equal('');
        // Back to valid value
        node.value = 'pouet';
        TestUtils.Simulate.change(node);
        chai_1.expect(onInvalid.callCount).to.equal(1);
        chai_1.expect(onChange.callCount).to.equal(2);
        args = onChange.args[1];
        chai_1.expect(args[0]).to.be.instanceOf(index_1.DataCube);
        chai_1.expect(args[0].clusterName).to.equal('pouet');
        chai_1.expect(args[1]).to.equal(true);
        chai_1.expect(args[2]).to.equal('clusterName');
        chai_1.expect(node.value).to.equal('pouet');
    });
    describe('with stringToValue/valueToString', () => {
        beforeEach(() => {
            let stringToValue = (str) => str.toLowerCase();
            let valueToString = (str) => str.toUpperCase();
            component = TestUtils.renderIntoDocument(React.createElement(immutable_input_1.ImmutableInput, {instance: mocks_1.DataCubeMock.twitter(), path: 'clusterName', validator: /^.+$/, onChange: onChange, onInvalid: onInvalid, stringToValue: stringToValue, valueToString: valueToString}));
            node = index_2.findDOMNode(component);
        });
        it('works for valid values', () => {
            chai_1.expect(node.value).to.equal('DRUID');
            node.value = 'GIRAFFE';
            TestUtils.Simulate.change(node);
            chai_1.expect(onInvalid.callCount).to.equal(0);
            chai_1.expect(onChange.callCount).to.equal(1);
            const args = onChange.args[0];
            chai_1.expect(args[0]).to.be.instanceOf(index_1.DataCube);
            chai_1.expect(args[0].clusterName).to.equal('giraffe');
            chai_1.expect(args[1]).to.equal(true);
            chai_1.expect(args[2]).to.equal('clusterName');
        });
    });
});
