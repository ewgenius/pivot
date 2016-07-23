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
var router = express_1.Router();
router.post('/', (req, res) => {
    var message = req.body.message;
    if (!message || typeof message !== 'string') {
        res.status(400).send({
            error: 'Error must have a message'
        });
    }
    else {
        console.error(`Client Error: ${JSON.stringify(req.body)}`);
        res.send(`Error logged @ ${new Date().toISOString()}`);
    }
});
module.exports = router;