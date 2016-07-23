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
const plywood_1 = require('plywood');
const general_1 = require('../../../common/utils/general/general');
const index_1 = require('../../../common/models/index');
const index_2 = require('../../../common/manifests/index');
const file_1 = require('../file/file');
const file_manager_1 = require('../file-manager/file-manager');
const cluster_manager_1 = require('../cluster-manager/cluster-manager');
const updater_1 = require('../updater/updater');
class SettingsManager {
    constructor(settingsLocation, options) {
        var logger = options.logger;
        this.logger = logger;
        this.verbose = Boolean(options.verbose);
        this.anchorPath = options.anchorPath;
        this.settingsLocation = settingsLocation;
        this.fileManagers = [];
        this.clusterManagers = [];
        this.initialLoadTimeout = options.initialLoadTimeout || 30000;
        this.appSettings = index_1.AppSettings.BLANK;
        switch (settingsLocation.location) {
            case 'transient':
                this.currentWork = Q(null)
                    .then(() => {
                    return settingsLocation.initAppSettings ? this.reviseSettings(settingsLocation.initAppSettings) : null;
                })
                    .catch(e => {
                    logger.error(`Fatal settings initialization error: ${e.message}`);
                    throw e;
                });
                break;
            case 'local':
                this.currentWork = Q.fcall(() => {
                    var appSettingsJS = file_1.loadFileSync(settingsLocation.uri, 'yaml');
                    appSettingsJS = general_1.inlineVars(appSettingsJS, process.env);
                    return index_1.AppSettings.fromJS(appSettingsJS, { visualizations: index_2.MANIFESTS });
                })
                    .then((appSettings) => {
                    return this.reviseSettings(appSettings);
                })
                    .catch(e => {
                    logger.error(`Fatal settings load error: ${e.message}`);
                    throw e;
                });
                break;
            default:
                throw new Error(`unknown location ${settingsLocation.location}`);
        }
        this.makeMaxTimeCheckTimer();
    }
    getClusterManagerFor(clusterName) {
        return plywood_1.helper.find(this.clusterManagers, (clusterManager) => clusterManager.cluster.name === clusterName);
    }
    addClusterManager(cluster, dataCubes) {
        const { verbose, logger, anchorPath } = this;
        var initialExternals = dataCubes.map(dataCube => {
            return {
                name: dataCube.name,
                external: dataCube.toExternal(),
                suppressIntrospection: dataCube.getIntrospection() === 'none'
            };
        });
        // Make a cluster manager for each cluster and assign the correct initial externals to it.
        logger.log(`Adding cluster manager for '${cluster.name}' with ${general_1.pluralIfNeeded(dataCubes.length, 'dataCube')}`);
        var clusterManager = new cluster_manager_1.ClusterManager(cluster, {
            logger: logger,
            verbose: verbose,
            anchorPath: anchorPath,
            initialExternals: initialExternals,
            onExternalChange: this.onExternalChange.bind(this, cluster),
            generateExternalName: this.generateDataCubeName.bind(this)
        });
        this.clusterManagers.push(clusterManager);
        return clusterManager.init();
    }
    removeClusterManager(cluster) {
        this.clusterManagers = this.clusterManagers.filter((clusterManager) => {
            if (clusterManager.cluster.name !== cluster.name)
                return true;
            clusterManager.destroy();
            return false;
        });
    }
    getFileManagerFor(uri) {
        return plywood_1.helper.find(this.fileManagers, (fileManager) => fileManager.uri === uri);
    }
    addFileManager(dataCube) {
        if (dataCube.clusterName !== 'native')
            throw new Error(`data cube '${dataCube.name}' must be native to have a file manager`);
        const { verbose, logger, anchorPath } = this;
        var fileManager = new file_manager_1.FileManager({
            logger: logger,
            verbose: verbose,
            anchorPath: anchorPath,
            uri: dataCube.source,
            subsetExpression: dataCube.subsetExpression,
            onDatasetChange: this.onDatasetChange.bind(this, dataCube.name)
        });
        this.fileManagers.push(fileManager);
        return fileManager.init();
    }
    removeFileManager(dataCube) {
        if (dataCube.clusterName !== 'native')
            throw new Error(`data cube '${dataCube.name}' must be native to have a file manager`);
        this.fileManagers = this.fileManagers.filter((fileManager) => {
            if (fileManager.uri !== dataCube.source)
                return true;
            fileManager.destroy();
            return false;
        });
    }
    getSettings(opts = {}) {
        var currentWork = this.currentWork;
        // Refresh all clusters
        var currentWork = currentWork.then(() => {
            // ToDo: utilize dataCubeOfInterest
            return Q.all(this.clusterManagers.map(clusterManager => clusterManager.refresh()));
        });
        var timeout = opts.timeout || this.initialLoadTimeout;
        if (timeout !== 0) {
            currentWork = currentWork.timeout(timeout)
                .catch(e => {
                this.logger.error(`Settings load timeout hit, continuing`);
            });
        }
        return currentWork.then(() => this.appSettings);
    }
    reviseSettings(newSettings) {
        var tasks = [
            this.reviseClusters(newSettings),
            this.reviseDataCubes(newSettings)
        ];
        this.appSettings = newSettings;
        return Q.all(tasks);
    }
    reviseClusters(newSettings) {
        const { verbose, logger } = this;
        var oldSettings = this.appSettings;
        var tasks = [];
        updater_1.updater(oldSettings.clusters, newSettings.clusters, {
            onExit: (oldCluster) => {
                this.removeClusterManager(oldCluster);
            },
            onUpdate: (newCluster) => {
                logger.log(`${newCluster.name} UPDATED cluster`);
            },
            onEnter: (newCluster) => {
                tasks.push(this.addClusterManager(newCluster, newSettings.getDataCubesForCluster(newCluster.name)));
            }
        });
        return Q.all(tasks);
    }
    reviseDataCubes(newSettings) {
        const { verbose, logger } = this;
        var oldSettings = this.appSettings;
        var tasks = [];
        var oldNativeDataCubes = oldSettings.getDataCubesForCluster('native');
        var newNativeDataCubes = newSettings.getDataCubesForCluster('native');
        updater_1.updater(oldNativeDataCubes, newNativeDataCubes, {
            onExit: (oldDataCube) => {
                if (oldDataCube.clusterName === 'native') {
                    this.removeFileManager(oldDataCube);
                }
                else {
                    throw new Error(`only native datasources work for now`); // ToDo: fix
                }
            },
            onUpdate: (newDataCube) => {
                logger.log(`${newDataCube.name} UPDATED datasource`);
            },
            onEnter: (newDataCube) => {
                if (newDataCube.clusterName === 'native') {
                    tasks.push(this.addFileManager(newDataCube));
                }
                else {
                    throw new Error(`only native datasources work for now`); // ToDo: fix
                }
            }
        });
        return Q.all(tasks);
    }
    updateSettings(newSettings) {
        if (this.settingsLocation.readOnly)
            return Q.reject(new Error('must be writable'));
        this.appSettings = newSettings.attachExecutors((dataCube) => {
            if (dataCube.clusterName === 'native') {
                var fileManager = this.getFileManagerFor(dataCube.source);
                if (fileManager) {
                    var dataset = fileManager.dataset;
                    if (!dataset)
                        return null;
                    return plywood_1.basicExecutorFactory({
                        datasets: { main: dataset }
                    });
                }
            }
            else {
                var clusterManager = this.getClusterManagerFor(dataCube.clusterName);
                if (clusterManager) {
                    var external = clusterManager.getExternalByName(dataCube.name);
                    if (!external)
                        return null;
                    return plywood_1.basicExecutorFactory({
                        datasets: { main: external }
                    });
                }
            }
            return null;
        });
        return Q(null); // ToDo: actually save settings
    }
    generateDataCubeName(external) {
        const { appSettings } = this;
        var source = String(external.source);
        var candidateName = source;
        var i = 0;
        while (appSettings.getDataCube(candidateName)) {
            i++;
            candidateName = source + i;
        }
        return candidateName;
    }
    onDatasetChange(dataCubeName, changedDataset) {
        const { logger, verbose } = this;
        logger.log(`Got native dataset update for ${dataCubeName}`);
        var dataCube = this.appSettings.getDataCube(dataCubeName);
        if (!dataCube)
            throw new Error(`Unknown dataset ${dataCubeName}`);
        this.appSettings = this.appSettings.addOrUpdateDataCube(dataCube.updateWithDataset(changedDataset));
    }
    onExternalChange(cluster, dataCubeName, changedExternal) {
        if (!changedExternal.attributes || !changedExternal.requester)
            return;
        const { logger, verbose } = this;
        logger.log(`Got queryable external dataset update for ${dataCubeName} in cluster ${cluster.name}`);
        var dataCube = this.appSettings.getDataCube(dataCubeName);
        if (!dataCube) {
            dataCube = index_1.DataCube.fromClusterAndExternal(dataCubeName, cluster, changedExternal);
        }
        dataCube = dataCube.updateWithExternal(changedExternal);
        this.appSettings = this.appSettings.addOrUpdateDataCube(dataCube);
        return this.updateDataCubeMaxTime(dataCube);
    }
    makeMaxTimeCheckTimer() {
        const { logger } = this;
        // Periodically check if max time needs to be updated
        setInterval(() => {
            this.appSettings.dataCubes.forEach((dataCube) => {
                this.updateDataCubeMaxTime(dataCube);
            });
        }, 1000).unref();
    }
    updateDataCubeMaxTime(dataCube) {
        const { logger, verbose } = this;
        if (dataCube.refreshRule.isQuery() && dataCube.shouldUpdateMaxTime()) {
            return index_1.DataCube.updateMaxTime(dataCube)
                .then((updatedDataCube) => {
                logger.log(`Getting the latest MaxTime for '${updatedDataCube.name}'`);
                this.appSettings = this.appSettings.addOrUpdateDataCube(updatedDataCube);
            }, (e) => {
                logger.error(`Error getting MaxTime for ${dataCube.name}: ${e.message}`);
            });
        }
        else {
            return Q(null);
        }
    }
}
exports.SettingsManager = SettingsManager;
