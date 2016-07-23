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
const immutable_class_1 = require('immutable-class');
const plywood_1 = require('plywood');
const general_1 = require('../../utils/general/general');
function parseIntFromPossibleString(x) {
    return typeof x === 'string' ? parseInt(x, 10) : x;
}
var check;
class Cluster {
    constructor(parameters) {
        var name = parameters.name;
        if (typeof name !== 'string')
            throw new Error('must have name');
        if (name === 'native')
            throw new Error("cluster can not be called 'native'");
        this.name = name;
        this.type = parameters.type;
        general_1.ensureOneOf(this.type, Cluster.TYPE_VALUES, `In cluster '${this.name}' type`);
        this.host = parameters.host;
        this.version = parameters.version;
        this.timeout = parameters.timeout;
        this.sourceListScan = parameters.sourceListScan;
        if (this.sourceListScan)
            general_1.ensureOneOf(this.sourceListScan, Cluster.SOURCE_LIST_SCAN_VALUES, `In cluster '${this.name}' sourceListScan`);
        this.sourceListRefreshOnLoad = parameters.sourceListRefreshOnLoad || false;
        this.sourceListRefreshInterval = parameters.sourceListRefreshInterval;
        if (this.sourceListRefreshInterval && this.sourceListRefreshInterval < 1000) {
            throw new Error(`can not set sourceListRefreshInterval to < 1000 (is ${this.sourceListRefreshInterval})`);
        }
        this.sourceReintrospectOnLoad = parameters.sourceReintrospectOnLoad;
        this.sourceReintrospectInterval = parameters.sourceReintrospectInterval;
        if (this.sourceReintrospectInterval && this.sourceReintrospectInterval < 1000) {
            throw new Error(`can not set sourceReintrospectInterval to < 1000 (is ${this.sourceReintrospectInterval})`);
        }
        switch (this.type) {
            case 'druid':
                this.introspectionStrategy = parameters.introspectionStrategy;
                this.requestDecorator = parameters.requestDecorator;
                this.decoratorOptions = parameters.decoratorOptions;
                break;
            case 'mysql':
            case 'postgres':
                this.database = parameters.database;
                this.user = parameters.user;
                this.password = parameters.password;
                break;
        }
    }
    static isCluster(candidate) {
        return immutable_class_1.isInstanceOf(candidate, Cluster);
    }
    static fromJS(parameters) {
        var { name, type, host, version, timeout, sourceListScan, sourceListRefreshOnLoad, sourceListRefreshInterval, sourceReintrospectOnLoad, sourceReintrospectInterval, introspectionStrategy, requestDecorator, decoratorOptions, database, user, password } = parameters;
        var value = {
            name: name,
            type: type,
            host: host || parameters.druidHost || parameters.brokerHost,
            version: version,
            timeout: parseIntFromPossibleString(timeout),
            sourceListScan: sourceListScan,
            sourceListRefreshOnLoad: sourceListRefreshOnLoad,
            sourceListRefreshInterval: parseIntFromPossibleString(sourceListRefreshInterval),
            sourceReintrospectOnLoad: sourceReintrospectOnLoad,
            sourceReintrospectInterval: parseIntFromPossibleString(sourceReintrospectInterval),
            introspectionStrategy: introspectionStrategy,
            requestDecorator: requestDecorator,
            decoratorOptions: decoratorOptions,
            database: database,
            user: user,
            password: password
        };
        return new Cluster(value);
    }
    valueOf() {
        return {
            name: this.name,
            type: this.type,
            host: this.host,
            version: this.version,
            timeout: this.timeout,
            sourceListScan: this.sourceListScan,
            sourceListRefreshOnLoad: this.sourceListRefreshOnLoad,
            sourceListRefreshInterval: this.sourceListRefreshInterval,
            sourceReintrospectOnLoad: this.sourceReintrospectOnLoad,
            sourceReintrospectInterval: this.sourceReintrospectInterval,
            introspectionStrategy: this.introspectionStrategy,
            requestDecorator: this.requestDecorator,
            decoratorOptions: this.decoratorOptions,
            database: this.database,
            user: this.user,
            password: this.password
        };
    }
    toJS() {
        var js = {
            name: this.name,
            type: this.type
        };
        if (this.host)
            js.host = this.host;
        if (this.version)
            js.version = this.version;
        if (this.timeout)
            js.timeout = this.timeout;
        if (this.sourceListScan)
            js.sourceListScan = this.sourceListScan;
        if (this.sourceListRefreshOnLoad)
            js.sourceListRefreshOnLoad = this.sourceListRefreshOnLoad;
        if (this.sourceListRefreshInterval != null)
            js.sourceListRefreshInterval = this.sourceListRefreshInterval;
        if (this.sourceReintrospectOnLoad)
            js.sourceReintrospectOnLoad = this.sourceReintrospectOnLoad;
        if (this.sourceReintrospectInterval != null)
            js.sourceReintrospectInterval = this.sourceReintrospectInterval;
        if (this.introspectionStrategy)
            js.introspectionStrategy = this.introspectionStrategy;
        if (this.requestDecorator)
            js.requestDecorator = this.requestDecorator;
        if (this.decoratorOptions)
            js.decoratorOptions = this.decoratorOptions;
        if (this.database)
            js.database = this.database;
        if (this.user)
            js.user = this.user;
        if (this.password)
            js.password = this.password;
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[Cluster ${this.name} (${this.type})]`;
    }
    equals(other) {
        return Cluster.isCluster(other) &&
            this.name === other.name &&
            this.type === other.type &&
            this.host === other.host &&
            this.version === other.version &&
            this.sourceListScan === other.sourceListScan &&
            this.sourceListRefreshOnLoad === other.sourceListRefreshOnLoad &&
            this.sourceListRefreshInterval === other.sourceListRefreshInterval &&
            this.sourceReintrospectOnLoad === other.sourceReintrospectOnLoad &&
            this.sourceReintrospectInterval === other.sourceReintrospectInterval &&
            this.introspectionStrategy === other.introspectionStrategy &&
            this.requestDecorator === other.requestDecorator &&
            this.database === other.database &&
            this.user === other.user &&
            this.timeout === other.timeout &&
            this.password === other.password;
    }
    toClientCluster() {
        return new Cluster({
            name: this.name,
            type: this.type
        });
    }
    makeExternalFromSourceName(source, version) {
        return plywood_1.External.fromValue({
            engine: this.type,
            source: source,
            version: version,
            allowSelectQueries: true,
            allowEternity: false
        });
    }
    shouldScanSources() {
        return this.getSourceListScan() === 'auto';
    }
    getTimeout() {
        return this.timeout || Cluster.DEFAULT_TIMEOUT;
    }
    getSourceListScan() {
        return this.sourceListScan || Cluster.DEFAULT_SOURCE_LIST_SCAN;
    }
    getSourceListRefreshInterval() {
        return this.sourceListRefreshInterval != null ? this.sourceListRefreshInterval : Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL;
    }
    getSourceReintrospectInterval() {
        return this.sourceReintrospectInterval != null ? this.sourceReintrospectInterval : Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL;
    }
    getIntrospectionStrategy() {
        return this.introspectionStrategy || Cluster.DEFAULT_INTROSPECTION_STRATEGY;
    }
    change(propertyName, newValue) {
        var v = this.valueOf();
        if (!v.hasOwnProperty(propertyName)) {
            throw new Error(`Unknown property : ${propertyName}`);
        }
        v[propertyName] = newValue;
        return new Cluster(v);
    }
    changeHost(newHost) {
        return this.change('host', newHost);
    }
    changeTimeout(newTimeout) {
        return this.change('timeout', newTimeout);
    }
    changeSourceListRefreshInterval(newSourceListRefreshInterval) {
        return this.change('sourceListRefreshInterval', newSourceListRefreshInterval);
    }
}
Cluster.TYPE_VALUES = ['druid', 'mysql', 'postgres'];
Cluster.DEFAULT_TIMEOUT = 40000;
Cluster.DEFAULT_SOURCE_LIST_REFRESH_INTERVAL = 15000;
Cluster.DEFAULT_SOURCE_REINTROSPECT_INTERVAL = 120000;
Cluster.DEFAULT_INTROSPECTION_STRATEGY = 'segment-metadata-fallback';
Cluster.DEFAULT_SOURCE_LIST_SCAN = 'auto';
Cluster.SOURCE_LIST_SCAN_VALUES = ['disable', 'auto'];
exports.Cluster = Cluster;
check = Cluster;
