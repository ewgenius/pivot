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
const express_1 = require('express');
const plywood_1 = require('plywood');
const chronoshift_1 = require('chronoshift');
var router = express_1.Router();
router.post('/', (req, res) => {
    var { version, dataCube, dataSource, expression, timezone } = req.body;
    dataCube = dataCube || dataSource; // back compat
    if (version && version !== req.version) {
        res.status(412).send({
            error: 'incorrect version',
            action: 'reload'
        });
        return;
    }
    if (typeof dataCube !== 'string') {
        res.status(400).send({
            error: 'must have a dataCube'
        });
        return;
    }
    var queryTimezone = null;
    if (typeof timezone === 'string') {
        try {
            queryTimezone = chronoshift_1.Timezone.fromJS(timezone);
        }
        catch (e) {
            res.status(400).send({
                error: 'bad timezone',
                message: e.message
            });
            return;
        }
    }
    var ex = null;
    try {
        ex = plywood_1.Expression.fromJS(expression);
    }
    catch (e) {
        res.status(400).send({
            error: 'bad expression',
            message: e.message
        });
        return;
    }
    req.getSettings(dataCube)
        .then((appSettings) => {
        var myDataCube = appSettings.getDataCube(dataCube);
        if (!myDataCube) {
            res.status(400).send({ error: 'unknown data cube' });
            return;
        }
        if (!myDataCube.executor) {
            res.status(400).send({ error: 'un queryable data cube' });
            return;
        }
        return myDataCube.executor(ex, { timezone: queryTimezone }).then((data) => {
            res.json({
                result: plywood_1.Dataset.isDataset(data) ? data.toJS() : data
            });
        }, (e) => {
            console.log('error:', e.message);
            if (e.hasOwnProperty('stack')) {
                console.log(e.stack);
            }
            res.status(500).send({
                error: 'could not compute',
                message: e.message
            });
        });
    })
        .done();
});
module.exports = router;
