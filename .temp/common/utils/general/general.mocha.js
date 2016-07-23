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
const immutable_1 = require('immutable');
const general_1 = require('./general');
describe('General', () => {
    describe('moveInList', () => {
        it('works in simple case 0', () => {
            var list = immutable_1.List("ABCD".split(''));
            chai_1.expect(general_1.moveInList(list, 0, 0).join('')).to.equal('ABCD');
        });
        it('works in simple case 1', () => {
            var list = immutable_1.List("ABCD".split(''));
            chai_1.expect(general_1.moveInList(list, 0, 1).join('')).to.equal('ABCD');
        });
        it('works in simple case 2', () => {
            var list = immutable_1.List("ABCD".split(''));
            chai_1.expect(general_1.moveInList(list, 0, 2).join('')).to.equal('BACD');
        });
        it('works in simple case 3', () => {
            var list = immutable_1.List("ABCD".split(''));
            chai_1.expect(general_1.moveInList(list, 0, 3).join('')).to.equal('BCAD');
        });
        it('works in simple case 4', () => {
            var list = immutable_1.List("ABCD".split(''));
            chai_1.expect(general_1.moveInList(list, 0, 4).join('')).to.equal('BCDA');
        });
    });
    describe('verifyUrlSafeName', () => {
        it('works in good case', () => {
            general_1.verifyUrlSafeName('a_b-c.d~E059');
        });
        it('works in bad case', () => {
            chai_1.expect(() => {
                general_1.verifyUrlSafeName('abcd%po#@$moon is!cool');
            }).to.throw("'abcd%po#@$moon is!cool' is not a URL safe name. Try 'abcd_po_moon_is_cool' instead?");
        });
    });
    describe('makeTitle', () => {
        it('works in simple snake case', () => {
            chai_1.expect(general_1.makeTitle('hello_world')).to.equal('Hello World');
        });
        it('works in simple camel case', () => {
            chai_1.expect(general_1.makeTitle('helloWorld')).to.equal('Hello World');
        });
        it('works with leading and trailing _', () => {
            chai_1.expect(general_1.makeTitle('_hello_world_')).to.equal('Hello World');
        });
        it('works with trailing numbers in the middle', () => {
            chai_1.expect(general_1.makeTitle('hello99_world')).to.equal('Hello99 World');
        });
        it('works with trailing numbers at the end', () => {
            chai_1.expect(general_1.makeTitle('hello_world99')).to.equal('Hello World99');
        });
    });
    describe('inlineVars', () => {
        it('works in simple case', () => {
            var json = {
                "hello": 1,
                "port": "%{PORT}%",
                "fox says %{}%": "%{FOX_SAYS}%"
            };
            var vars = {
                PORT: '1234',
                FOX_SAYS: 'Meow'
            };
            chai_1.expect(general_1.inlineVars(json, vars)).to.deep.equal({
                "hello": 1,
                "port": "1234",
                "fox says %{}%": "Meow"
            });
        });
        it('throw error if can not find var', () => {
            var json = {
                "hello": 1,
                "port": "%{PORT}%",
                "fox says %{}%": "%{FOX_SAYS}%"
            };
            var vars = {
                PORT: '1234'
            };
            chai_1.expect(() => general_1.inlineVars(json, vars)).to.throw("could not find variable 'FOX_SAYS'");
        });
    });
    describe('ensureOneOf', () => {
        it('does not thrown an error is one of', () => {
            general_1.ensureOneOf('Honda', ['Honda', 'Toyota', 'BMW'], 'Car');
        });
        it('throw error not one of', () => {
            chai_1.expect(() => {
                general_1.ensureOneOf('United Kingdom', ['Honda', 'Toyota', 'BMW'], 'Car');
            }).to.throw("Car must be on of 'Honda', 'Toyota', 'BMW' (is 'United Kingdom')");
        });
        it('throw error not one of (undefined)', () => {
            chai_1.expect(() => {
                general_1.ensureOneOf(undefined, ['Honda', 'Toyota', 'BMW'], 'Car');
            }).to.throw("Car must be on of 'Honda', 'Toyota', 'BMW' (is not defined)");
        });
    });
});
