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
const express = require('express');
const hsts = require('hsts');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const chronoshift_1 = require('chronoshift');
// Init chronoshift
if (!chronoshift_1.WallTime.rules) {
    var tzData = require("chronoshift/lib/walltime/walltime-data.js");
    chronoshift_1.WallTime.init(tzData.rules, tzData.zones);
}
const config_1 = require('./config');
const plywoodRoutes = require('./routes/plywood/plywood');
const plyqlRoutes = require('./routes/plyql/plyql');
const pivotRoutes = require('./routes/pivot/pivot');
const settingsRoutes = require('./routes/settings/settings');
const mkurlRoutes = require('./routes/mkurl/mkurl');
const healthRoutes = require('./routes/health/health');
const errorRoutes = require('./routes/error/error');
const views_1 = require('./views');
function makeGuard(guard) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            next(new Error('no user'));
            return;
        }
        const { allow } = user;
        if (!allow) {
            next(new Error('no user.allow'));
            return;
        }
        if (!allow[guard]) {
            next(new Error('not allowed'));
            return;
        }
        next();
    };
}
var app = express();
app.disable('x-powered-by');
if (config_1.SERVER_SETTINGS.getTrustProxy() === 'always') {
    app.set('trust proxy', 1); // trust first proxy
}
function addRoutes(attach, router) {
    app.use(attach, router);
    app.use(config_1.SERVER_SETTINGS.getServerRoot() + attach, router);
}
function addGuardedRoutes(attach, guard, router) {
    var guardHandler = makeGuard(guard);
    app.use(attach, guardHandler, router);
    app.use(config_1.SERVER_SETTINGS.getServerRoot() + attach, guardHandler, router);
}
app.use(compress());
app.use(logger('dev'));
if (config_1.SERVER_SETTINGS.getStrictTransportSecurity() === "always") {
    app.use(hsts({
        maxAge: 10886400000,
        includeSubDomains: true,
        preload: true
    }));
}
addRoutes('/health', healthRoutes);
addRoutes('/', express.static(path.join(__dirname, '../../build/public')));
addRoutes('/', express.static(path.join(__dirname, '../../assets')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use((req, res, next) => {
    req.user = null;
    req.version = config_1.VERSION;
    req.getSettings = (opts = {}) => {
        return config_1.SETTINGS_MANAGER.getSettings(opts);
    };
    next();
});
if (config_1.AUTH) {
    app.use(config_1.AUTH);
}
else {
    app.use((req, res, next) => {
        if (process.env['PIVOT_ENABLE_SETTINGS']) {
            req.user = {
                id: 'admin',
                email: 'admin@admin.com',
                displayName: 'Admin',
                allow: {
                    settings: true
                }
            };
        }
        next();
    });
}
// Data routes
addRoutes('/plywood', plywoodRoutes);
addRoutes('/plyql', plyqlRoutes);
addRoutes('/mkurl', mkurlRoutes);
addRoutes('/error', errorRoutes);
if (process.env['PIVOT_ENABLE_SETTINGS']) {
    addGuardedRoutes('/settings', 'settings', settingsRoutes);
}
// View routes
if (config_1.SERVER_SETTINGS.getIframe() === 'deny') {
    app.use((req, res, next) => {
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
        next();
    });
}
addRoutes('/', pivotRoutes);
// Catch 404 and redirect to /
app.use((req, res, next) => {
    res.redirect('/');
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        config_1.LOGGER.error(`Server Error: ${err.message}`);
        config_1.LOGGER.error(err.stack);
        res.status(err.status || 500);
        res.send(views_1.errorLayout({ version: config_1.VERSION, title: 'Error' }, err.message, err));
    });
}
// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    config_1.LOGGER.error(`Server Error: ${err.message}`);
    config_1.LOGGER.error(err.stack);
    res.status(err.status || 500);
    res.send(views_1.errorLayout({ version: config_1.VERSION, title: 'Error' }, err.message));
});
module.exports = app;
