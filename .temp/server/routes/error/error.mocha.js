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
const express = require('express');
const supertest = require('supertest');
const bodyParser = require('body-parser');
const errorRouter = require('./error');
var app = express();
app.use(bodyParser.json());
app.use('/', errorRouter);
var consoleErr = "";
console.error = function (t) {
    consoleErr += t;
};
describe('error route', () => {
    var errorObj = {
        message: "Uncaught TypeError: Cannot read property 'start' of null",
        file: "http://localhost:9090/pivot-main.9dcd61eb37d2c3c22868.js",
        line: 52026,
        column: 50,
        stack: "TypeError: Cannot read property 'start' of null\n    " +
            "at LineChart.floorRange (http://localhost:9090/pivot-main.9dcd61eb37d2c3c22868.js:52026:50)\n    " +
            "at LineChart.globalMouseUpListener (http://localhost:9090/pivot-main.9dcd61eb37d2c3c22868.js:52052:36)"
    };
    it('gets a 200', (testComplete) => {
        supertest(app)
            .post('/')
            .set('Content-Type', "application/json")
            .send(errorObj)
            .expect(200)
            .end((err, res) => {
            chai_1.expect(consoleErr).to.deep.equal('Client Error: ' + JSON.stringify(errorObj));
            testComplete();
        });
    });
    it('validates error has a message', (testComplete) => {
        supertest(app)
            .post('/')
            .set('Content-Type', "application/json")
            .send({ query: 'select things' })
            .expect(400)
            .end((err, res) => {
            chai_1.expect(res.body.error).to.deep.equal('Error must have a message');
            testComplete();
        });
    });
});