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
const plywood_1 = require('plywood');
const bodyParser = require('body-parser');
const app_settings_mock_1 = require('../../../common/models/app-settings/app-settings.mock');
const plywoodRouter = require('./plywood');
var app = express();
app.use(bodyParser.json());
var appSettings = app_settings_mock_1.AppSettingsMock.wikiOnlyWithExecutor();
app.use((req, res, next) => {
    req.user = null;
    req.version = '0.9.4';
    req.getSettings = (dataCubeOfInterest) => Q(appSettings);
    next();
});
app.use('/', plywoodRouter);
describe('plywood router', () => {
    it('version mismatch', (testComplete) => {
        supertest(app)
            .post('/')
            .set('Content-Type', "application/json")
            .send({
            version: '0.9.3',
            expression: plywood_1.$('main').toJS()
        })
            .expect('Content-Type', "application/json; charset=utf-8")
            .expect(412)
            .expect({
            error: 'incorrect version',
            action: 'reload'
        }, testComplete);
    });
    it('must have dataCube', (testComplete) => {
        supertest(app)
            .post('/')
            .set('Content-Type', "application/json")
            .send({
            version: '0.9.4',
            expression: plywood_1.$('main').toJS()
        })
            .expect('Content-Type', "application/json; charset=utf-8")
            .expect(400)
            .expect({
            "error": "must have a dataCube"
        }, testComplete);
    });
    it('does a query (value)', (testComplete) => {
        supertest(app)
            .post('/')
            .set('Content-Type', "application/json")
            .send({
            version: '0.9.4',
            expression: plywood_1.$('main').count().toJS(),
            dataCube: 'wiki'
        })
            .expect('Content-Type', "application/json; charset=utf-8")
            .expect(200)
            .expect({
            result: 10
        }, testComplete);
    });
    it('does a query (dataset)', (testComplete) => {
        supertest(app)
            .post('/')
            .set('Content-Type', "application/json")
            .send({
            version: '0.9.4',
            expression: plywood_1.$('main')
                .split('$channel', 'Channel')
                .apply('Count', plywood_1.$('main').count())
                .sort('$Count', 'descending')
                .limit(2)
                .toJS(),
            dataSource: 'wiki' // back compat
        })
            .expect('Content-Type', "application/json; charset=utf-8")
            .expect(200)
            .expect({
            result: [
                { Channel: 'en', Count: 4 },
                { Channel: 'vi', Count: 4 }
            ]
        }, testComplete);
    });
});
