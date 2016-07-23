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
const plywood_1 = require('plywood');
const plywood_druid_requester_1 = require('plywood-druid-requester');
const plywood_mysql_requester_1 = require('plywood-mysql-requester');
const plywood_postgres_requester_1 = require('plywood-postgres-requester');
function properRequesterFactory(options) {
    var { type, host, retry, timeout, verbose, concurrentLimit } = options;
    var requester;
    switch (type) {
        case 'druid':
            requester = plywood_druid_requester_1.druidRequesterFactory({
                host: host,
                timeout: timeout || 30000,
                requestDecorator: options.druidRequestDecorator
            });
            break;
        case 'mysql':
            requester = plywood_mysql_requester_1.mySqlRequesterFactory({
                host: host,
                database: options.database,
                user: options.user,
                password: options.password
            });
            break;
        case 'postgres':
            requester = plywood_postgres_requester_1.postgresRequesterFactory({
                host: host,
                database: options.database,
                user: options.user,
                password: options.password
            });
            break;
        default:
            throw new Error(`unknown requester type ${type}`);
    }
    if (retry) {
        requester = plywood_1.helper.retryRequesterFactory({
            requester: requester,
            retry: retry,
            delay: 500,
            retryOnTimeout: false
        });
    }
    if (verbose) {
        requester = plywood_1.helper.verboseRequesterFactory({
            requester: requester
        });
    }
    if (concurrentLimit) {
        requester = plywood_1.helper.concurrentLimitRequesterFactory({
            requester: requester,
            concurrentLimit: concurrentLimit
        });
    }
    return requester;
}
exports.properRequesterFactory = properRequesterFactory;
