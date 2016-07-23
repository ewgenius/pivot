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
const path = require('path');
const Q = require('q');
const plywood_1 = require('plywood');
const requester_1 = require('../requester/requester');
const CONNECTION_RETRY_TIMEOUT = 20000;
const DRUID_REQUEST_DECORATOR_MODULE_VERSION = 1;
function noop() { }
function getSourceFromExternal(external) {
    return String(external.source);
}
class ClusterManager {
    constructor(cluster, options) {
        this.managedExternals = [];
        this.sourceListRefreshInterval = 0;
        this.sourceListRefreshTimer = null;
        this.sourceReintrospectInterval = 0;
        this.sourceReintrospectTimer = null;
        this.initialConnectionTimer = null;
        if (!cluster)
            throw new Error('must have cluster');
        this.logger = options.logger;
        this.verbose = Boolean(options.verbose);
        this.anchorPath = options.anchorPath;
        this.cluster = cluster;
        this.initialConnectionEstablished = false;
        this.introspectedSources = {};
        this.version = cluster.version;
        this.managedExternals = options.initialExternals || [];
        this.onExternalChange = options.onExternalChange || noop;
        this.generateExternalName = options.generateExternalName || getSourceFromExternal;
        this.updateRequestDecorator();
        this.updateRequester();
        this.managedExternals.forEach((managedExternal) => {
            managedExternal.external = managedExternal.external.attachRequester(this.requester);
        });
    }
    // Do initialization
    init() {
        const { cluster, logger } = this;
        if (cluster.sourceListRefreshOnLoad) {
            logger.log(`Cluster '${cluster.name}' will refresh source list on load`);
        }
        if (cluster.sourceReintrospectOnLoad) {
            logger.log(`Cluster '${cluster.name}' will reintrospect sources on load`);
        }
        return Q(null)
            .then(() => this.establishInitialConnection())
            .then(() => this.introspectSources())
            .then(() => this.scanSourceList());
    }
    destroy() {
        if (this.sourceListRefreshTimer) {
            clearInterval(this.sourceListRefreshTimer);
            this.sourceListRefreshTimer = null;
        }
        if (this.sourceReintrospectTimer) {
            clearInterval(this.sourceReintrospectTimer);
            this.sourceReintrospectTimer = null;
        }
        if (this.initialConnectionTimer) {
            clearTimeout(this.initialConnectionTimer);
            this.initialConnectionTimer = null;
        }
    }
    addManagedExternal(managedExternal) {
        this.managedExternals.push(managedExternal);
        return Q(this.onExternalChange(managedExternal.name, managedExternal.external));
    }
    updateManagedExternal(managedExternal, newExternal) {
        if (managedExternal.external.equals(newExternal))
            return;
        managedExternal.external = newExternal;
        return Q(this.onExternalChange(managedExternal.name, managedExternal.external));
    }
    updateRequestDecorator() {
        const { cluster, logger, anchorPath } = this;
        if (!cluster.requestDecorator)
            return;
        var requestDecoratorPath = path.resolve(anchorPath, cluster.requestDecorator);
        logger.log(`Loading requestDecorator from '${requestDecoratorPath}'`);
        try {
            this.requestDecoratorModule = require(requestDecoratorPath);
        }
        catch (e) {
            throw new Error(`error loading druidRequestDecorator module from '${requestDecoratorPath}': ${e.message}`);
        }
        if (this.requestDecoratorModule.version !== DRUID_REQUEST_DECORATOR_MODULE_VERSION) {
            throw new Error(`druidRequestDecorator module '${requestDecoratorPath}' has incorrect version`);
        }
    }
    updateRequester() {
        const { cluster, logger, requestDecoratorModule } = this;
        var druidRequestDecorator = null;
        if (cluster.type === 'druid' && requestDecoratorModule) {
            logger.log(`Cluster '${cluster.name}' creating requestDecorator`);
            druidRequestDecorator = requestDecoratorModule.druidRequestDecoratorFactory(logger, {
                options: cluster.decoratorOptions,
                cluster: cluster
            });
        }
        this.requester = requester_1.properRequesterFactory({
            type: cluster.type,
            host: cluster.host,
            timeout: cluster.getTimeout(),
            verbose: this.verbose,
            concurrentLimit: 5,
            druidRequestDecorator: druidRequestDecorator,
            database: cluster.database,
            user: cluster.user,
            password: cluster.password
        });
    }
    updateSourceListRefreshTimer() {
        const { logger, cluster } = this;
        if (this.sourceListRefreshInterval !== cluster.getSourceListRefreshInterval()) {
            this.sourceListRefreshInterval = cluster.getSourceListRefreshInterval();
            if (this.sourceListRefreshTimer) {
                logger.log(`Clearing sourceListRefresh timer in cluster '${cluster.name}'`);
                clearInterval(this.sourceListRefreshTimer);
                this.sourceListRefreshTimer = null;
            }
            if (this.sourceListRefreshInterval && cluster.shouldScanSources()) {
                logger.log(`Setting up sourceListRefresh timer in cluster '${cluster.name}' (every ${this.sourceListRefreshInterval}ms)`);
                this.sourceListRefreshTimer = setInterval(() => {
                    this.scanSourceList().catch((e) => {
                        logger.error(`Cluster '${cluster.name}' encountered and error during SourceListRefresh: ${e.message}`);
                    });
                }, this.sourceListRefreshInterval);
                this.sourceListRefreshTimer.unref();
            }
        }
    }
    updateSourceReintrospectTimer() {
        const { logger, cluster } = this;
        if (this.sourceReintrospectInterval !== cluster.getSourceReintrospectInterval()) {
            this.sourceReintrospectInterval = cluster.getSourceReintrospectInterval();
            if (this.sourceReintrospectTimer) {
                logger.log(`Clearing sourceReintrospect timer in cluster '${cluster.name}'`);
                clearInterval(this.sourceReintrospectTimer);
                this.sourceReintrospectTimer = null;
            }
            if (this.sourceReintrospectInterval) {
                logger.log(`Setting up sourceReintrospect timer in cluster '${cluster.name}' (every ${this.sourceReintrospectInterval}ms)`);
                this.sourceReintrospectTimer = setInterval(() => {
                    this.introspectSources().catch((e) => {
                        logger.error(`Cluster '${cluster.name}' encountered and error during SourceReintrospect: ${e.message}`);
                    });
                }, this.sourceReintrospectInterval);
                this.sourceReintrospectTimer.unref();
            }
        }
    }
    establishInitialConnection() {
        const { logger, verbose, cluster } = this;
        var deferred = Q.defer();
        var retryNumber = -1;
        var lastTryAt;
        var attemptConnection = () => {
            retryNumber++;
            if (retryNumber === 0) {
                if (verbose)
                    logger.log(`Attempting to connect to cluster '${cluster.name}'`);
            }
            else {
                logger.log(`Re-attempting to connect to cluster '${cluster.name}' (retry ${retryNumber})`);
            }
            lastTryAt = Date.now();
            plywood_1.External.getConstructorFor(cluster.type)
                .getVersion(this.requester)
                .then((version) => {
                this.onConnectionEstablished();
                this.internalizeVersion(version).then(() => deferred.resolve(null));
            }, (e) => {
                var msSinceLastTry = Date.now() - lastTryAt;
                var msToWait = Math.max(1, CONNECTION_RETRY_TIMEOUT - msSinceLastTry);
                logger.error(`Failed to connect to cluster '${cluster.name}' because: ${e.message} (will retry in ${msToWait}ms)`);
                this.initialConnectionTimer = setTimeout(attemptConnection, msToWait);
            });
        };
        attemptConnection();
        return deferred.promise;
    }
    onConnectionEstablished() {
        const { logger, cluster } = this;
        logger.log(`Connected to cluster '${cluster.name}'`);
        this.initialConnectionEstablished = true;
        this.updateSourceListRefreshTimer();
        this.updateSourceReintrospectTimer();
    }
    internalizeVersion(version) {
        // If there is a version already do nothing
        if (this.version)
            return Q(null);
        const { logger, cluster } = this;
        logger.log(`Cluster '${cluster.name}' is running ${cluster.type}@${version}`);
        this.version = version;
        // Update all externals if needed
        return Q.all(this.managedExternals.map(managedExternal => {
            if (managedExternal.external.version)
                return Q(null);
            return this.updateManagedExternal(managedExternal, managedExternal.external.changeVersion(version));
        }));
    }
    introspectManagedExternal(managedExternal) {
        const { logger, verbose, cluster } = this;
        if (managedExternal.suppressIntrospection)
            return Q(null);
        if (verbose)
            logger.log(`Cluster '${cluster.name}' introspecting '${managedExternal.name}'`);
        return managedExternal.external.introspect()
            .then((introspectedExternal) => {
            this.introspectedSources[String(introspectedExternal.source)] = true;
            return this.updateManagedExternal(managedExternal, introspectedExternal);
        }, (e) => {
            logger.error(`Cluster '${cluster.name}' could not introspect '${managedExternal.name}' because: ${e.message}`);
        });
    }
    // See if any new sources were added to the cluster
    scanSourceList() {
        const { logger, cluster, verbose } = this;
        if (!cluster.shouldScanSources())
            return Q(null);
        logger.log(`Scanning cluster '${cluster.name}' for new sources`);
        return plywood_1.External.getConstructorFor(cluster.type).getSourceList(this.requester)
            .then((sources) => {
            if (verbose)
                logger.log(`For cluster '${cluster.name}' got sources: [${sources.join(', ')}]`);
            // For every un-accounted source: make an external and add it to the managed list.
            var introspectionTasks = [];
            sources.forEach((source) => {
                var existingExternalsForSource = this.managedExternals.filter(managedExternal => getSourceFromExternal(managedExternal.external) === source);
                if (existingExternalsForSource.length) {
                    if (verbose)
                        logger.log(`Cluster '${cluster.name}' already has an external for '${source}' ('${existingExternalsForSource[0].name}')`);
                    if (!this.introspectedSources[source]) {
                        // If this source has never been introspected introspect all of its externals
                        logger.log(`Cluster '${cluster.name}' has never seen '${source}' and will introspect '${existingExternalsForSource[0].name}'`);
                        existingExternalsForSource.forEach(existingExternalForSource => {
                            introspectionTasks.push(this.introspectManagedExternal(existingExternalForSource));
                        });
                    }
                }
                else {
                    logger.log(`Cluster '${cluster.name}' making external for '${source}'`);
                    var external = cluster.makeExternalFromSourceName(source, this.version).attachRequester(this.requester);
                    var newManagedExternal = {
                        name: this.generateExternalName(external),
                        external: external,
                        autoDiscovered: true
                    };
                    introspectionTasks.push(this.addManagedExternal(newManagedExternal)
                        .then(() => this.introspectManagedExternal(newManagedExternal)));
                }
            });
            return Q.all(introspectionTasks);
        }, (e) => {
            logger.error(`Failed to get source list from cluster '${cluster.name}' because: ${e.message}`);
        });
    }
    // See if any new dimensions or measures were added to the existing externals
    introspectSources() {
        const { logger, cluster } = this;
        logger.log(`Introspecting all sources in cluster '${cluster.name}'`);
        return Q.all(this.managedExternals.map((managedExternal) => {
            return this.introspectManagedExternal(managedExternal);
        }));
    }
    // Refresh the cluster now, will trigger onExternalUpdate and then return an empty promise when done
    refresh() {
        const { cluster, initialConnectionEstablished } = this;
        var process = Q(null);
        if (!initialConnectionEstablished)
            return process;
        if (cluster.sourceReintrospectOnLoad) {
            process = process.then(() => this.introspectSources());
        }
        if (cluster.sourceListRefreshOnLoad) {
            process = process.then(() => this.scanSourceList());
        }
        return process;
    }
    getExternalByName(name) {
        var managedExternal = plywood_1.helper.findByName(this.managedExternals, name);
        return managedExternal ? managedExternal.external : null;
    }
}
exports.ClusterManager = ClusterManager;
