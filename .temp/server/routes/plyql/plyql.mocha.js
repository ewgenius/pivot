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
const Q = require('q');
const express = require('express');
const supertest = require('supertest');
const mime = require('mime');
const bodyParser = require('body-parser');
const app_settings_mock_1 = require('../../../common/models/app-settings/app-settings.mock');
const plyqlRouter = require('./plyql');
var app = express();
app.use(bodyParser.json());
var appSettings = app_settings_mock_1.AppSettingsMock.wikiOnlyWithExecutor();
app.use((req, res, next) => {
    req.user = null;
    req.version = '0.9.4';
    req.getSettings = (dataCubeOfInterest) => Q(appSettings);
    next();
});
app.use('/', plyqlRouter);
var pageQuery = "SELECT SUM(added) as Added FROM `wiki` GROUP BY page ORDER BY Added DESC LIMIT 10;";
var timeQuery = "SELECT TIME_BUCKET(time, 'PT1H', 'Etc/UTC') as TimeByHour, SUM(added) as Added FROM `wiki` GROUP BY 1 ORDER BY TimeByHour ASC";
var tests = [
    {
        outputType: "json",
        query: pageQuery,
        testName: "POST json pages added"
    },
    {
        outputType: "json",
        query: timeQuery,
        testName: "POST json timeseries"
    },
    {
        outputType: "csv",
        query: pageQuery,
        testName: "POST csv pages added"
    },
    {
        outputType: "csv",
        query: timeQuery,
        testName: "POST csv timeseries"
    },
    {
        outputType: "tsv",
        query: pageQuery,
        testName: "POST tsv pages added"
    },
    {
        outputType: "tsv",
        query: timeQuery,
        testName: "POST tsv timeseries"
    }
];
function responseHandler(err, res) {
    console.log("Response Type: " + res.type);
    console.log("Response Text: " + res.text);
}
function testPlyqlHelper(testName, contentType, queryStr) {
    it(testName, (testComplete) => {
        supertest(app)
            .post('/')
            .set('Content-Type', "application/json")
            .send(queryStr)
            .expect('Content-Type', contentType + "; charset=utf-8")
            .expect(200, testComplete);
    });
}
describe('plyql router', () => {
    tests.forEach(function (test) {
        testPlyqlHelper(test.testName, mime.lookup(test.outputType), JSON.stringify(test, null, 2));
    });
});
