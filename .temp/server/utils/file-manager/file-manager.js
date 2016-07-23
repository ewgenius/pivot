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
const fs = require('fs-promise');
const plywood_1 = require('plywood');
const parser_1 = require('../../../common/utils/parser/parser');
function getFileData(filePath) {
    return fs.readFile(filePath, 'utf-8')
        .then((fileData) => {
        try {
            return parser_1.parseData(fileData, path.extname(filePath));
        }
        catch (e) {
            throw new Error(`could not parse '${filePath}': ${e.message}`);
        }
    })
        .then((fileJSON) => {
        fileJSON.forEach((d) => {
            d['time'] = new Date(d['time']);
        });
        return fileJSON;
    });
}
exports.getFileData = getFileData;
function noop() { }
class FileManager {
    constructor(options) {
        this.logger = options.logger;
        this.verbose = Boolean(options.verbose);
        this.anchorPath = options.anchorPath;
        this.uri = options.uri;
        this.subsetExpression = options.subsetExpression;
        this.verbose = Boolean(options.verbose);
        this.onDatasetChange = options.onDatasetChange || noop;
    }
    // Do initialization
    init() {
        const { logger, anchorPath, uri } = this;
        var filePath = path.resolve(anchorPath, uri);
        logger.log(`Loading file ${filePath}`);
        return getFileData(filePath)
            .then((rawData) => {
            logger.log(`Loaded file ${filePath} (rows = ${rawData.length})`);
            var dataset = plywood_1.Dataset.fromJS(rawData).hide();
            if (this.subsetExpression) {
                dataset = dataset.filter(this.subsetExpression.getFn(), {});
            }
            this.dataset = dataset;
            this.onDatasetChange(dataset);
        }, (e) => {
            logger.error(`Failed to load file ${filePath} because: ${e.message}`);
        });
    }
    destroy() {
        // Nothing here for now
    }
}
exports.FileManager = FileManager;
