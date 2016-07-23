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
require('./pivot-entry.css');
const React = require('react');
const ReactDOM = require('react-dom');
const error_monitor_1 = require('./utils/error-monitor/error-monitor');
const loader_1 = require('./components/loader/loader');
error_monitor_1.addErrorMonitor();
var container = document.getElementsByClassName('app-container')[0];
if (!container)
    throw new Error('container not found');
// Add the loader
ReactDOM.render(React.createElement(loader_1.Loader), container);
var config = window['__CONFIG__'];
if (!config || !config.version || !config.appSettings || !config.appSettings.dataCubes) {
    throw new Error('config not found');
}
let view = window.location.hash.split(/\//)[0];
if (config.appSettings.dataCubes.length || view === '#settings') {
    var version = config.version;
    require.ensure([
        'chronoshift',
        'chronoshift/lib/walltime/walltime-data.js',
        './utils/ajax/ajax',
        '../common/models/index',
        '../common/manifests/index',
        './views/pivot-application/pivot-application'
    ], (require) => {
        const WallTime = require('chronoshift').WallTime;
        const queryUrlExecutorFactory = require('./utils/ajax/ajax').queryUrlExecutorFactory;
        const AppSettings = require('../common/models/index').AppSettings;
        const MANIFESTS = require('../common/manifests/index').MANIFESTS;
        const PivotApplication = require('./views/pivot-application/pivot-application').PivotApplication;
        var appSettings = AppSettings.fromJS(config.appSettings, {
            visualizations: MANIFESTS,
            executorFactory: (dataCube) => {
                return queryUrlExecutorFactory(dataCube.name, 'plywood', version);
            }
        });
        // Init chronoshift
        if (!WallTime.rules) {
            var tzData = require('chronoshift/lib/walltime/walltime-data.js');
            WallTime.init(tzData.rules, tzData.zones);
        }
        ReactDOM.render(React.createElement(PivotApplication, {
            version: version,
            user: config.user,
            appSettings: appSettings,
            readOnly: config.readOnly
        }), container);
    }, 'pivot-main');
}
else {
    require.ensure([
        './components/no-data-cubes-application/no-data-cubes-application'
    ], (require) => {
        var NoDataCubesApplication = require('./components/no-data-cubes-application/no-data-cubes-application').NoDataCubesApplication;
        ReactDOM.render(React.createElement(NoDataCubesApplication, {}), container);
    }, 'no-data-cubes');
}
// Polyfill =====================================
// From ../../assets/polyfill/drag-drop-polyfill.js
var div = document.createElement('div');
var dragDiv = 'draggable' in div;
var evts = 'ondragstart' in div && 'ondrop' in div;
var needsPatch = !(dragDiv || evts) || /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
if (needsPatch) {
    require.ensure([
        '../../lib/polyfill/drag-drop-polyfill.min.js',
        '../../lib/polyfill/drag-drop-polyfill.css'
    ], (require) => {
        var DragDropPolyfill = require('../../lib/polyfill/drag-drop-polyfill.min.js');
        require('../../lib/polyfill/drag-drop-polyfill.css');
        DragDropPolyfill.Initialize({});
    }, 'ios-drag-drop');
}
