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
function parseIntFromPossibleString(x) {
    return typeof x === 'string' ? parseInt(x, 10) : x;
}
function ensureOneOfOrNull(name, thing, things) {
    if (thing == null)
        return;
    if (things.indexOf(thing) === -1) {
        throw new Error(`'${thing}' is not a valid value for ${name}, must be one of: ${things.join(', ')}`);
    }
}
var check;
class ServerSettings {
    constructor(parameters) {
        var port = parameters.port || ServerSettings.DEFAULT_PORT;
        if (typeof port !== 'number')
            throw new Error(`port must be a number`);
        this.port = port;
        this.serverHost = parameters.serverHost;
        this.serverRoot = parameters.serverRoot;
        this.pageMustLoadTimeout = parameters.pageMustLoadTimeout;
        this.iframe = parameters.iframe;
        ensureOneOfOrNull('iframe', this.iframe, ServerSettings.IFRAME_VALUES);
        this.trustProxy = parameters.trustProxy;
        ensureOneOfOrNull('trustProxy', this.trustProxy, ServerSettings.TRUST_PROXY_VALUES);
        this.strictTransportSecurity = parameters.strictTransportSecurity;
        ensureOneOfOrNull('strictTransportSecurity', this.strictTransportSecurity, ServerSettings.STRICT_TRANSPORT_SECURITY_VALUES);
    }
    static isServerSettings(candidate) {
        return immutable_class_1.isInstanceOf(candidate, ServerSettings);
    }
    static fromJS(parameters, configFileDir) {
        var { port, serverHost, serverRoot, pageMustLoadTimeout, iframe, trustProxy, strictTransportSecurity } = parameters;
        if (serverRoot && serverRoot[0] !== '/')
            serverRoot = '/' + serverRoot;
        if (serverRoot === '/')
            serverRoot = null;
        return new ServerSettings({
            port: parseIntFromPossibleString(port),
            serverHost: serverHost,
            serverRoot: serverRoot,
            pageMustLoadTimeout: pageMustLoadTimeout,
            iframe: iframe,
            trustProxy: trustProxy,
            strictTransportSecurity: strictTransportSecurity
        });
    }
    valueOf() {
        return {
            port: this.port,
            serverHost: this.serverHost,
            serverRoot: this.serverRoot,
            pageMustLoadTimeout: this.pageMustLoadTimeout,
            iframe: this.iframe,
            trustProxy: this.trustProxy,
            strictTransportSecurity: this.strictTransportSecurity
        };
    }
    toJS() {
        var js = {
            port: this.port
        };
        if (this.serverHost)
            js.serverHost = this.serverHost;
        if (this.serverRoot)
            js.serverRoot = this.serverRoot;
        if (this.pageMustLoadTimeout)
            js.pageMustLoadTimeout = this.pageMustLoadTimeout;
        if (this.iframe)
            js.iframe = this.iframe;
        if (this.trustProxy)
            js.trustProxy = this.trustProxy;
        if (this.strictTransportSecurity)
            js.strictTransportSecurity = this.strictTransportSecurity;
        return js;
    }
    toJSON() {
        return this.toJS();
    }
    toString() {
        return `[ServerSettings ${this.port}]`;
    }
    equals(other) {
        return ServerSettings.isServerSettings(other) &&
            this.port === other.port &&
            this.serverHost === other.serverHost &&
            this.serverRoot === other.serverRoot &&
            this.pageMustLoadTimeout === other.pageMustLoadTimeout &&
            this.iframe === other.iframe &&
            this.trustProxy === other.trustProxy &&
            this.strictTransportSecurity === other.strictTransportSecurity;
    }
    getServerHost() {
        return this.serverHost;
    }
    getServerRoot() {
        return this.serverRoot || ServerSettings.DEFAULT_SERVER_ROOT;
    }
    getPageMustLoadTimeout() {
        return this.pageMustLoadTimeout || ServerSettings.DEFAULT_PAGE_MUST_LOAD_TIMEOUT;
    }
    getIframe() {
        return this.iframe || ServerSettings.DEFAULT_IFRAME;
    }
    getTrustProxy() {
        return this.trustProxy || ServerSettings.DEFAULT_TRUST_PROXY;
    }
    getStrictTransportSecurity() {
        return this.strictTransportSecurity || ServerSettings.DEFAULT_STRICT_TRANSPORT_SECURITY;
    }
}
ServerSettings.DEFAULT_PORT = 9090;
ServerSettings.DEFAULT_SERVER_ROOT = '/pivot';
ServerSettings.DEFAULT_PAGE_MUST_LOAD_TIMEOUT = 800;
ServerSettings.IFRAME_VALUES = ["allow", "deny"];
ServerSettings.DEFAULT_IFRAME = "allow";
ServerSettings.TRUST_PROXY_VALUES = ["none", "always"];
ServerSettings.DEFAULT_TRUST_PROXY = "none";
ServerSettings.STRICT_TRANSPORT_SECURITY_VALUES = ["none", "always"];
ServerSettings.DEFAULT_STRICT_TRANSPORT_SECURITY = "none";
exports.ServerSettings = ServerSettings;
check = ServerSettings;
