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
const mock_react_component_1 = require('./mock-react-component');
describe('mockReactComponent', () => {
    class TestClass {
        render() {
            throw new Error('Hey, render is supposed to be stubbed !');
        }
        componentDidMount() {
            throw new Error('Hey, componentDidMount is supposed to be stubbed !');
        }
    }
    it('should stub render and componentDidMount', () => {
        mock_react_component_1.mockReactComponent(TestClass);
        let myInstance = new TestClass();
        chai_1.expect(myInstance.render()).to.equal(null);
        chai_1.expect(myInstance.componentDidMount()).to.equal(undefined);
    });
    // This is not ideal since it relies on the previous test to have ran
    // However it's important to demonstrate the mocking is class-based and not
    // scope based.
    it('should restore render and componentDidMount', () => {
        TestClass.restore();
        let myInstance = new TestClass();
        chai_1.expect(() => myInstance.render())
            .to.throw('Hey, render is supposed to be stubbed !');
        chai_1.expect(() => myInstance.componentDidMount())
            .to.throw('Hey, componentDidMount is supposed to be stubbed !');
    });
});
