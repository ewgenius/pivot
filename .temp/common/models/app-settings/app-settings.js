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
const index_1 = require('../../utils/index');
const plywood_1 = require('plywood');
const general_1 = require('../../utils/general/general');
const cluster_1 = require('../cluster/cluster');
const customization_1 = require('../customization/customization');
const data_cube_1 = require('../data-cube/data-cube');
const link_view_config_1 = require('../link-view-config/link-view-config');
var check;
class AppSettings {
    constructor(parameters) {
        const { clusters, customization, dataCubes, linkViewConfig } = parameters;
        for (var dataCube of dataCubes) {
            if (dataCube.clusterName === 'native')
                continue;
            if (!plywood_1.helper.findByName(clusters, dataCube.clusterName)) {
                throw new Error(`data cube ${dataCube.name} refers to an unknown cluster ${dataCube.clusterName}`);
            }
        }
        this.clusters = clusters;
        this.customization = customization;
        this.dataCubes = dataCubes;
        this.linkViewConfig = linkViewConfig;
    }
    static isAppSettings(candidate) {
        return immutable_class_1.isInstanceOf(candidate, AppSettings);
    }
    static fromJS(parameters, context) {
        if (!context)
            throw new Error('AppSettings must have context');
        var clusters;
        if (parameters.clusters) {
            clusters = parameters.clusters.map(cluster => cluster_1.Cluster.fromJS(cluster));
        }
        else if (general_1.hasOwnProperty(parameters, 'druidHost') || general_1.hasOwnProperty(parameters, 'brokerHost')) {
            var clusterJS = JSON.parse(JSON.stringify(parameters));
            clusterJS.name = 'druid';
            clusterJS.type = 'druid';
            clusterJS.host = clusterJS.druidHost || clusterJS.brokerHost;
            clusters = [cluster_1.Cluster.fromJS(clusterJS)];
        }
        else {
            clusters = [];
        }
        var executorFactory = context.executorFactory;
        var dataCubes = (parameters.dataCubes || parameters.dataSources || []).map((dataCubeJS) => {
            var dataCubeClusterName = dataCubeJS.clusterName || dataCubeJS.engine;
            if (dataCubeClusterName !== 'native') {
                var cluster = plywood_1.helper.findByName(clusters, dataCubeClusterName);
                if (!cluster)
                    throw new Error(`Can not find cluster '${dataCubeClusterName}' for data cube '${dataCubeJS.name}'`);
            }
            var dataCubeObject = data_cube_1.DataCube.fromJS(dataCubeJS, { cluster: cluster });
            if (executorFactory) {
                var executor = executorFactory(dataCubeObject);
                if (executor)
                    dataCubeObject = dataCubeObject.attachExecutor(executor);
            }
            return dataCubeObject;
        });
        var value = {
            clusters: clusters,
            customization: customization_1.Customization.fromJS(parameters.customization || {}),
            dataCubes: dataCubes,
            linkViewConfig: parameters.linkViewConfig ? link_view_config_1.LinkViewConfig.fromJS(parameters.linkViewConfig, { dataCubes: dataCubes, visualizations: context.visualizations }) : null
        };
        return new AppSettings(value);
    }
    valueOf() {
        return {
            clusters: this.clusters,
            customization: this.customization,
            dataCubes: this.dataCubes,
            linkViewConfig: this.linkViewConfig
        };
    }
    toJS() {
        var js = {};
        js.clusters = this.clusters.map(cluster => cluster.toJS());
        js.customization = this.customization.toJS();
        js.dataCubes = this.dataCubes.map(dataCube => dataCube.toJS());
        if (this.linkViewConfig)
            js.linkViewConfig = this.linkViewConfig.toJS();
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[AppSettings dataCubes=${this.dataCubes.length}]`;
    }
    equals(other) {
        return AppSettings.isAppSettings(other) &&
            immutable_class_1.immutableArraysEqual(this.clusters, other.clusters) &&
            immutable_class_1.immutableEqual(this.customization, other.customization) &&
            immutable_class_1.immutableArraysEqual(this.dataCubes, other.dataCubes) &&
            Boolean(this.linkViewConfig) === Boolean(other.linkViewConfig);
    }
    toClientSettings() {
        var value = this.valueOf();
        value.clusters = value.clusters.map((c) => c.toClientCluster());
        value.dataCubes = value.dataCubes
            .filter((ds) => ds.isQueryable())
            .map((ds) => ds.toClientDataCube());
        return new AppSettings(value);
    }
    getDataCubesForCluster(clusterName) {
        return this.dataCubes.filter(dataCube => dataCube.clusterName === clusterName);
    }
    getDataCube(dataCubeName) {
        return plywood_1.helper.findByName(this.dataCubes, dataCubeName);
    }
    addOrUpdateDataCube(dataCube) {
        var value = this.valueOf();
        value.dataCubes = plywood_1.helper.overrideByName(value.dataCubes, dataCube);
        return new AppSettings(value);
    }
    attachExecutors(executorFactory) {
        var value = this.valueOf();
        value.dataCubes = value.dataCubes.map((ds) => {
            var executor = executorFactory(ds);
            if (executor)
                ds = ds.attachExecutor(executor);
            return ds;
        });
        return new AppSettings(value);
    }
    changeCustomization(customization) {
        return this.change('customization', customization);
    }
    changeClusters(clusters) {
        return this.change('clusters', clusters);
    }
    addCluster(cluster) {
        return this.changeClusters(plywood_1.helper.overrideByName(this.clusters, cluster));
    }
    change(propertyName, newValue) {
        return index_1.ImmutableUtils.change(this, propertyName, newValue);
    }
    changeDataCubes(dataCubes) {
        return this.change('dataCubes', dataCubes);
    }
    addDataCube(dataCube) {
        return this.changeDataCubes(plywood_1.helper.overrideByName(this.dataCubes, dataCube));
    }
    filterDataCubes(fn) {
        var value = this.valueOf();
        value.dataCubes = value.dataCubes.filter(fn);
        return new AppSettings(value);
    }
}
AppSettings.BLANK = AppSettings.fromJS({}, { visualizations: [] });
exports.AppSettings = AppSettings;
check = AppSettings;
