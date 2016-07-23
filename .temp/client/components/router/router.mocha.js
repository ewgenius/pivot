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
const index_1 = require('../../utils/test-utils/index');
const chai_1 = require('chai');
const React = require('react');
const ReactDOM = require('react-dom');
const router_1 = require('./router');
class Fake extends React.Component {
    constructor() {
        super();
    }
    render() {
        let str = `${this.props.action || ''}${this.props.itemId || ''}`;
        return React.createElement("div", {className: "fakey-fakey"}, str);
    }
}
// -- end of Fake class
describe('Router', () => {
    var children;
    var component;
    var node;
    var updateHash;
    var isActiveRoute;
    beforeEach(() => {
        updateHash = (newHash) => {
            window.location.hash = newHash;
            component = ReactDOM.render(React.createElement(router_1.Router, {rootFragment: "root", hash: newHash}, children), node);
        };
        isActiveRoute = (route) => {
            chai_1.expect(window.location.hash, 'window.location.hash should be').to.equal(route);
        };
    });
    describe('with initial location', () => {
        beforeEach(() => {
            node = window.document.createElement('div');
            children = [
                React.createElement(router_1.Route, {fragment: "foo"}, React.createElement("div", {className: "foo-class"}, "foo"), React.createElement(router_1.Route, {fragment: "foo-0"}, React.createElement("div", {className: "foo-0-class"}, "foo-0")), React.createElement(router_1.Route, {fragment: "foo-1"}, React.createElement("div", {className: "foo-1-class"}, "foo-1"))),
                React.createElement(router_1.Route, {fragment: "bar"}, React.createElement("div", {className: "bar-class"}, "bar")),
                React.createElement(router_1.Route, {fragment: "baz"}, React.createElement("div", {className: "baz-class"}, "baz"), React.createElement(router_1.Route, {fragment: ":itemId"}, React.createElement(Fake, null)) // Fake is gonna get passed whatever replaces :bazId in the hash
                , " // Fake is gonna get passed whatever replaces :bazId in the hash"),
                React.createElement(router_1.Route, {fragment: "qux"}, React.createElement("div", {className: "qux-class"}, "qux"), React.createElement(router_1.Route, {fragment: ":itemId/:action=edit"}, React.createElement(Fake, null)) // default value for variable
                , " // default value for variable")
            ];
            updateHash('root/bar');
        });
        it('initializes to the location', () => {
            chai_1.expect(index_1.findDOMNode(component).className, 'should contain class').to.equal('bar-class');
            isActiveRoute('#root/bar');
        });
        it('fixes multiple slashes', () => {
            updateHash('#root//foo/foo-1///');
            isActiveRoute('#root/foo/foo-1');
            var domNode = index_1.findDOMNode(component);
            chai_1.expect(domNode.className, 'should contain class').to.equal('foo-1-class');
            chai_1.expect(domNode.innerHTML).to.equal('foo-1');
        });
        it('fixes wrong fragment and defaults to first route', () => {
            updateHash('#root/ABLAB');
            isActiveRoute('#root/foo');
            var domNode = index_1.findDOMNode(component);
            chai_1.expect(domNode.className, 'should contain class').to.equal('foo-class');
            chai_1.expect(domNode.innerHTML).to.equal('foo');
        });
        it('strips extra fragments', () => {
            updateHash('#root/bar/UNNECESSARY');
            isActiveRoute('#root/bar');
            updateHash('#root/baz/pouet/UNNECESSARY');
            var domNode = index_1.findDOMNode(component);
            isActiveRoute('#root/baz/pouet');
            chai_1.expect(domNode.className, 'should contain class').to.equal('fakey-fakey');
            chai_1.expect(domNode.innerHTML).to.equal('pouet');
        });
        it('follows the window.location.hash\'s changes', () => {
            updateHash('#root/baz');
            chai_1.expect(index_1.findDOMNode(component).className, 'should contain class').to.equal('baz-class');
            isActiveRoute('#root/baz');
        });
        it('works with variables in the hash', () => {
            updateHash('#root/baz/pouet');
            var domNode = index_1.findDOMNode(component);
            chai_1.expect(domNode.className, 'should contain class').to.equal('fakey-fakey');
            chai_1.expect(domNode.innerHTML).to.equal('pouet');
            isActiveRoute('#root/baz/pouet');
        });
        it('recognizes default for a variable', () => {
            updateHash('#root/qux/myItem');
            var domNode = index_1.findDOMNode(component);
            chai_1.expect(domNode.className, 'should contain class').to.equal('fakey-fakey');
            chai_1.expect(domNode.innerHTML).to.equal('editmyItem');
            isActiveRoute('#root/qux/myItem/edit');
        });
    });
    describe('without initial location', () => {
        beforeEach(() => {
            node = window.document.createElement('div');
            children = [
                React.createElement(router_1.Route, {fragment: "foo"}, React.createElement("div", {className: "foo-class"}, "foo")),
                React.createElement(router_1.Route, {fragment: "bar"}, React.createElement("div", {className: "bar-class"}, "bar")),
                React.createElement(router_1.Route, {fragment: "baz"}, React.createElement("div", {className: "baz-class"}, "baz"))
            ];
            updateHash('root');
        });
        it('defaults to the first route', () => {
            isActiveRoute('#root/foo');
        });
        it('follows the window.location.hash\'s changes', () => {
            updateHash('#root/baz');
            chai_1.expect(index_1.findDOMNode(component).className, 'should contain class').to.equal('baz-class');
            isActiveRoute('#root/baz');
        });
    });
});
