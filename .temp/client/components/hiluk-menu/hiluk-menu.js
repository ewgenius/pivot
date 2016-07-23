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
require('./hiluk-menu.css');
const React = require('react');
const index_1 = require('../../../common/models/index');
const constants_1 = require('../../config/constants');
const download_1 = require('../../utils/download/download');
const bubble_menu_1 = require('../bubble-menu/bubble-menu');
class HilukMenu extends React.Component {
    constructor() {
        super();
        this.state = {
            url: null,
            specificUrl: null
        };
    }
    componentDidMount() {
        var { essence, getUrlPrefix } = this.props;
        var urlPrefix = getUrlPrefix();
        var url = essence.getURL(urlPrefix);
        var specificUrl = essence.filter.isRelative() ? essence.convertToSpecificFilter().getURL(urlPrefix) : null;
        this.setState({
            url: url,
            specificUrl: specificUrl
        });
    }
    openRawDataModal() {
        const { openRawDataModal, onClose } = this.props;
        openRawDataModal();
        onClose();
    }
    onExport() {
        const { onClose, getDownloadableDataset, essence } = this.props;
        const { dataCube, splits } = essence;
        if (!getDownloadableDataset)
            return;
        const filters = essence.getEffectiveFilter().getFileString(dataCube.timeAttribute);
        var splitsString = splits.toArray().map((split) => {
            var dimension = split.getDimension(dataCube.dimensions);
            if (!dimension)
                return '';
            return `${constants_1.STRINGS.splitDelimiter}_${dimension.name}`;
        }).join("_");
        download_1.download(getDownloadableDataset(), download_1.makeFileName(dataCube.name, filters, splitsString), 'csv');
        onClose();
    }
    render() {
        const { openOn, onClose, externalViews, essence, getDownloadableDataset } = this.props;
        const { url, specificUrl } = this.state;
        var shareOptions = [
            React.createElement("li", {className: "copy-url clipboard", key: "copy-url", "data-clipboard-text": url, onClick: onClose}, constants_1.STRINGS.copyUrl)
        ];
        if (specificUrl) {
            shareOptions.push(React.createElement("li", {className: "copy-specific-url clipboard", key: "copy-specific-url", "data-clipboard-text": specificUrl, onClick: onClose}, constants_1.STRINGS.copySpecificUrl));
        }
        if (getDownloadableDataset()) {
            shareOptions.push(React.createElement("li", {className: "export", key: "export", onClick: this.onExport.bind(this)}, constants_1.STRINGS.exportToCSV));
        }
        shareOptions.push(React.createElement("li", {className: "view-raw-data", key: "view-raw-data", onClick: this.openRawDataModal.bind(this)}, constants_1.STRINGS.viewRawData));
        if (externalViews) {
            externalViews.forEach((externalView, i) => {
                const url = externalView.linkGeneratorFn(essence.dataCube, essence.timezone, essence.filter, essence.splits);
                if (typeof url !== "string")
                    return;
                var title = `${constants_1.STRINGS.openIn} ${externalView.title}`;
                var target = externalView.sameWindow ? "_self" : "_blank";
                shareOptions.push(React.createElement("li", {key: `custom-url-${i}`}, React.createElement("a", {href: url, target: target}, title)));
            });
        }
        var stage = index_1.Stage.fromSize(200, 200);
        return React.createElement(bubble_menu_1.BubbleMenu, {className: "hiluk-menu", direction: "down", stage: stage, openOn: openOn, onClose: onClose}, React.createElement("ul", {className: "bubble-list"}, shareOptions));
    }
}
exports.HilukMenu = HilukMenu;
