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
require('./raw-data-modal.css');
const React = require('react');
const ReactDOM = require('react-dom');
const plywood_1 = require('plywood');
const index_1 = require('../../../common/models/index');
const general_1 = require('../../../common/utils/general/general');
const download_1 = require('../../utils/download/download');
const formatter_1 = require('../../../common/utils/formatter/formatter');
const dom_1 = require('../../utils/dom/dom');
const sizing_1 = require('../../utils/sizing/sizing');
const constants_1 = require('../../config/constants');
const modal_1 = require('../modal/modal');
const button_1 = require('../button/button');
const scroller_1 = require('../scroller/scroller');
const loader_1 = require('../loader/loader');
const query_error_1 = require('../query-error/query-error');
const HEADER_HEIGHT = 30;
const ROW_HEIGHT = 30;
const LIMIT = 100;
const TIME_COL_WIDTH = 180;
const BOOLEAN_COL_WIDTH = 100;
const NUMBER_COL_WIDTH = 100;
const DEFAULT_COL_WIDTH = 200;
function getColumnWidth(attribute) {
    switch (attribute.type) {
        case 'BOOLEAN':
            return BOOLEAN_COL_WIDTH;
        case 'NUMBER':
            return NUMBER_COL_WIDTH;
        case 'TIME':
            return TIME_COL_WIDTH;
        default:
            return DEFAULT_COL_WIDTH;
    }
}
function classFromAttribute(attribute) {
    return dom_1.classNames(String(attribute.type).toLowerCase().replace(/\//g, '-'), { unsplitable: attribute.unsplitable });
}
class RawDataModal extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: false,
            dataset: null,
            scrollLeft: 0,
            scrollTop: 0,
            error: null,
            stage: null
        };
        this.globalResizeListener = this.globalResizeListener.bind(this);
    }
    componentDidMount() {
        this.mounted = true;
        const { essence } = this.props;
        this.fetchData(essence);
        this.globalResizeListener();
    }
    componentWillUnmount() {
        this.mounted = false;
    }
    fetchData(essence) {
        const { dataCube } = essence;
        const $main = plywood_1.$('main');
        const query = $main.filter(essence.getEffectiveFilter().toExpression()).limit(LIMIT);
        this.setState({ loading: true });
        dataCube.executor(query, { timezone: essence.timezone })
            .then((dataset) => {
            if (!this.mounted)
                return;
            this.setState({
                dataset: dataset,
                loading: false
            });
        }, (error) => {
            if (!this.mounted)
                return;
            this.setState({
                error: error,
                loading: false
            });
        });
    }
    globalResizeListener() {
        var { table } = this.refs;
        var tableDOM = ReactDOM.findDOMNode(table);
        if (!tableDOM)
            return;
        this.setState({
            stage: index_1.Stage.fromClientRect(tableDOM.getBoundingClientRect())
        });
    }
    onScroll(scrollTop, scrollLeft) {
        this.setState({ scrollLeft: scrollLeft, scrollTop: scrollTop });
    }
    getStringifiedFilters() {
        const { essence } = this.props;
        const { dataCube } = essence;
        return essence.getEffectiveFilter().clauses.map((clause, i) => {
            const dimension = dataCube.getDimensionByExpression(clause.expression);
            if (!dimension)
                return null;
            var evaluatedClause = dimension.kind === 'time' ? essence.evaluateClause(clause) : clause;
            return formatter_1.formatFilterClause(dimension, evaluatedClause, essence.timezone);
        }).toList();
    }
    getSortedAttributes(dataCube) {
        const timeAttributeName = dataCube.timeAttribute ? dataCube.timeAttribute.name : null;
        var attributeRank = (attribute) => {
            const name = attribute.name;
            if (name === timeAttributeName) {
                return 1;
            }
            else if (attribute.unsplitable) {
                return 3;
            }
            else {
                return 2;
            }
        };
        return dataCube.attributes.sort((a1, a2) => {
            const score1 = attributeRank(a1);
            const score2 = attributeRank(a2);
            if (score1 === score2) {
                return a1.name.toLowerCase().localeCompare(a2.name.toLowerCase());
            }
            return score1 - score2;
        });
    }
    renderFilters() {
        const filters = this.getStringifiedFilters().map((filter, i) => {
            return React.createElement("li", {className: "filter", key: i}, filter);
        }).toList();
        const limit = React.createElement("li", {className: "limit", key: "limit"}, "First ", LIMIT, " events matching ");
        return filters.unshift(limit);
    }
    renderHeader() {
        const { essence } = this.props;
        const { dataset } = this.state;
        if (!dataset)
            return null;
        const { dataCube } = essence;
        const attributes = this.getSortedAttributes(dataCube);
        return attributes.map((attribute, i) => {
            const name = attribute.name;
            const width = getColumnWidth(attribute);
            const style = { width: width };
            const key = name;
            return (React.createElement("div", {className: dom_1.classNames("header-cell", classFromAttribute(attribute)), style: style, key: i}, React.createElement("div", {className: "title-wrap"}, general_1.makeTitle(key))));
        });
    }
    getVisibleIndices(rowCount, height) {
        const { scrollTop } = this.state;
        return [
            Math.max(0, Math.floor(scrollTop / ROW_HEIGHT)),
            Math.min(rowCount, Math.ceil((scrollTop + height) / ROW_HEIGHT))
        ];
    }
    renderRows() {
        const { essence } = this.props;
        const { dataset, scrollLeft, stage } = this.state;
        if (!dataset)
            return null;
        const { dataCube } = essence;
        const rawData = dataset.data;
        const [firstRowToShow, lastRowToShow] = this.getVisibleIndices(rawData.length, stage.height);
        const rows = rawData.slice(firstRowToShow, lastRowToShow);
        var attributes = this.getSortedAttributes(dataCube);
        var attributeWidths = attributes.map(getColumnWidth);
        const { startIndex, shownColumns } = sizing_1.getVisibleSegments(attributeWidths, scrollLeft, stage.width);
        var leftOffset = general_1.arraySum(attributeWidths.slice(0, startIndex));
        attributes = attributes.slice(startIndex, startIndex + shownColumns);
        var rowY = firstRowToShow * ROW_HEIGHT;
        return rows.map((datum, i) => {
            var cols = [];
            attributes.forEach((attribute) => {
                const name = attribute.name;
                const value = datum[name];
                const colStyle = {
                    width: getColumnWidth(attribute)
                };
                var displayValue = value;
                if (plywood_1.isDate(datum[name])) {
                    displayValue = datum[name].toISOString();
                }
                cols.push(React.createElement("div", {className: dom_1.classNames('cell', classFromAttribute(attribute)), key: name, style: colStyle}, React.createElement("span", {className: "cell-value"}, String(displayValue))));
            });
            const rowStyle = { top: rowY, left: leftOffset };
            rowY += ROW_HEIGHT;
            return React.createElement("div", {className: "row", style: rowStyle, key: i}, cols);
        });
    }
    render() {
        const { essence, onClose } = this.props;
        const { dataset, loading, error } = this.state;
        const { dataCube } = essence;
        const title = `${general_1.makeTitle(constants_1.STRINGS.segment)} ${constants_1.STRINGS.rawData}`;
        const filtersString = essence.getEffectiveFilter().getFileString(dataCube.timeAttribute);
        const scrollerLayout = {
            // Inner dimensions
            bodyWidth: general_1.arraySum(dataCube.attributes.map(getColumnWidth)),
            bodyHeight: (dataset ? dataset.data.length : 0) * ROW_HEIGHT,
            // Gutters
            top: HEADER_HEIGHT,
            right: 0,
            bottom: 0,
            left: 0
        };
        return React.createElement(modal_1.Modal, {className: "raw-data-modal", title: title, onClose: onClose}, React.createElement("div", {className: "content"}, React.createElement("ul", {className: "filters"}, this.renderFilters()), React.createElement(scroller_1.Scroller, {ref: "table", layout: scrollerLayout, topGutter: this.renderHeader(), body: this.renderRows(), onScroll: this.onScroll.bind(this)}), error ? React.createElement(query_error_1.QueryError, {error: error}) : null, loading ? React.createElement(loader_1.Loader, null) : null, React.createElement("div", {className: "button-bar"}, React.createElement(button_1.Button, {type: "primary", className: "close", onClick: onClose, title: constants_1.STRINGS.close}), React.createElement(button_1.Button, {type: "secondary", className: "download", onClick: download_1.download.bind(this, dataset, download_1.makeFileName(dataCube.name, filtersString, 'raw'), 'csv'), title: constants_1.STRINGS.download, disabled: Boolean(loading || error)}))));
    }
}
exports.RawDataModal = RawDataModal;
