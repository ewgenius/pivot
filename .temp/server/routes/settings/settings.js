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
const index_1 = require('../../../common/models/index');
const index_2 = require('../../../common/manifests/index');
const config_1 = require('../../config');
var router = express_1.Router();
router.get('/', (req, res) => {
    config_1.SETTINGS_MANAGER.getSettings()
        .then((appSettings) => {
        res.send({ appSettings: appSettings });
    }, (e) => {
        console.log('error:', e.message);
        if (e.hasOwnProperty('stack')) {
            console.log(e.stack);
        }
        res.status(500).send({
            error: 'could not compute',
            message: e.message
        });
    })
        .done();
});
router.post('/', (req, res) => {
    var { version, appSettings } = req.body;
    if (version && version !== config_1.VERSION) {
        res.status(412).send({
            error: 'incorrect version',
            action: 'reload'
        });
        return;
    }
    try {
        var appSettingsObject = index_1.AppSettings.fromJS(appSettings, { visualizations: index_2.MANIFESTS });
    }
    catch (e) {
        res.status(400).send({
            error: 'bad settings',
            message: e.message
        });
        return;
    }
    config_1.SETTINGS_MANAGER.updateSettings(appSettingsObject)
        .then(() => {
        res.send({ status: 'ok' });
    }, (e) => {
        console.log('error:', e.message);
        if (e.hasOwnProperty('stack')) {
            console.log(e.stack);
        }
        res.status(500).send({
            error: 'could not compute',
            message: e.message
        });
    })
        .done();
});
module.exports = router;
