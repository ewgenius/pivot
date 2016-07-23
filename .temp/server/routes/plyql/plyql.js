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
var router = express_1.Router();
var outputFunctions = {
    json: (data) => { return JSON.stringify(data, null, 2); },
    csv: (data) => { return data.toCSV(); },
    tsv: (data) => { return data.toTSV(); }
};
router.post('/', (req, res) => {
    var { version, outputType, query } = req.body;
    if (version && version !== req.version) {
        res.status(400).send({
            error: 'incorrect version',
            action: 'reload'
        });
        return;
    }
    if (typeof query !== "string") {
        var errmsg = "Query must be a string";
        res.status(400).send(errmsg);
        return;
    }
    try {
        var parsedSQL = plywood_1.Expression.parseSQL(query);
    }
    catch (e) {
        var errmsg = "Could not parse query as SQL: " + e.message;
        res.status(400).send(errmsg);
        return;
    }
    if (typeof outputType !== "string") {
        outputType = "json";
    }
    var outputFn;
    outputFn = outputFunctions[outputType];
    if (outputFn === undefined) {
        var errmsg = "Invalid output type: " + outputType;
        res.status(400).send(errmsg);
        return;
    }
    var parsedQuery = parsedSQL.expression;
    var dataCube = parsedSQL.table;
    if (!dataCube) {
        var errmsg = "Could not determine data cube name";
        res.status(400).send(errmsg);
        return;
    }
    parsedQuery = parsedQuery.substitute((ex) => {
        if (ex instanceof plywood_1.RefExpression && ex.name === dataCube) {
            return plywood_1.$("main");
        }
        return null;
    });
    req.getSettings(dataCube)
        .then((appSettings) => {
        var myDataCube = appSettings.getDataCube(dataCube);
        if (!myDataCube) {
            res.status(400).send({ error: 'unknown data cube' });
            return;
        }
        myDataCube.executor(parsedQuery).then((data) => {
            res.type(outputType);
            res.send(outputFn(plywood_1.Dataset.fromJS(data.toJS())));
        }, (error) => {
            res.status(500).send(`got error ${error.message}`);
        });
    })
        .done();
});
module.exports = router;
