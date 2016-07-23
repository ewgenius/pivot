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
require('./simple-table.css');
const React = require('react');
const dom_1 = require('../../utils/dom/dom');
const svg_icon_1 = require('../svg-icon/svg-icon');
const scroller_1 = require('../scroller/scroller');
const ROW_HEIGHT = 42;
const HEADER_HEIGHT = 26;
const ACTION_WIDTH = 30;
class SimpleTable extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    renderHeaders(columns, sortColumn, sortAscending) {
        var items = [];
        for (let i = 0; i < columns.length; i++) {
            let column = columns[i];
            let icon = null;
            if (sortColumn && sortColumn === column) {
                icon = React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/sort-arrow.svg'), className: `sort-arrow ${sortAscending ? 'ascending' : 'descending'}`});
            }
            items.push(React.createElement("div", {className: "header", style: { width: column.width }, key: `column-${i}`}, column.label, icon));
        }
        return React.createElement("div", {className: "column-headers"}, items);
    }
    getIcons(row, actions) {
        if (!actions || !actions.length)
            return null;
        var items = [];
        for (let i = 0; i < actions.length; i++) {
            let action = actions[i];
            items.push(React.createElement("div", {className: 'cell action', key: `action-${i}`, onClick: action.callback.bind(this, row)}, React.createElement(svg_icon_1.SvgIcon, {svg: require(`../../icons/${action.icon}.svg`)})));
        }
        return items;
    }
    labelizer(column) {
        if (typeof column.field === 'string') {
            return (row) => row[column.field];
        }
        return column.field;
    }
    renderRow(row, columns, index) {
        const { hoveredRowIndex } = this.state;
        var items = [];
        for (let i = 0; i < columns.length; i++) {
            let col = columns[i];
            let icon = col.cellIcon ? React.createElement(svg_icon_1.SvgIcon, {svg: require(`../../icons/${col.cellIcon}.svg`)}) : null;
            items.push(React.createElement("div", {className: dom_1.classNames('cell', { 'has-icon': !!col.cellIcon }), style: { width: col.width }, key: `cell-${i}`}, icon, this.labelizer(col)(row)));
        }
        return React.createElement("div", {className: dom_1.classNames('row', { hover: hoveredRowIndex === index }), key: `row-${index}`, style: { height: ROW_HEIGHT }}, items);
    }
    sortRows(rows, sortColumn, sortAscending) {
        if (!sortColumn)
            return rows;
        var labelize = this.labelizer(sortColumn);
        if (sortAscending) {
            return rows.sort((a, b) => {
                if (labelize(a) < labelize(b)) {
                    return -1;
                }
                else if (labelize(a) > labelize(b)) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
        }
        return rows.sort((a, b) => {
            if (labelize(a) < labelize(b)) {
                return 1;
            }
            else if (labelize(a) > labelize(b)) {
                return -1;
            }
            else {
                return 0;
            }
        });
    }
    renderRows(rows, columns, sortColumn, sortAscending) {
        if (!rows || !rows.length)
            return null;
        rows = this.sortRows(rows, sortColumn, sortAscending);
        var items = [];
        for (let i = 0; i < rows.length; i++) {
            items.push(this.renderRow(rows[i], columns, i));
        }
        return items;
    }
    getLayout(columns, rows, actions) {
        const width = columns.reduce((a, b) => a + b.width, 0);
        const directActionsCount = actions.filter((a) => !a.inEllipsis).length;
        const indirectActionsCount = directActionsCount !== actions.length ? 1 : 0;
        return {
            // Inner dimensions
            bodyWidth: width,
            bodyHeight: rows.length * ROW_HEIGHT,
            // Gutters
            top: HEADER_HEIGHT,
            right: directActionsCount * 30 + indirectActionsCount * 30,
            bottom: 0,
            left: 0
        };
    }
    getDirectActions(actions) {
        return actions.filter((action) => !action.inEllipsis);
    }
    renderActions(rows, actions) {
        const { hoveredRowIndex, hoveredActionIndex } = this.state;
        const directActions = this.getDirectActions(actions);
        const generator = (row, i) => {
            let isRowHovered = i === hoveredRowIndex;
            let icons = directActions.map((action, j) => {
                return React.createElement("div", {className: dom_1.classNames("icon", { hover: isRowHovered && j === hoveredActionIndex }), key: `icon-${j}`, style: { width: ACTION_WIDTH }}, React.createElement(svg_icon_1.SvgIcon, {svg: require(`../../icons/${action.icon}.svg`)}));
            });
            return React.createElement("div", {className: dom_1.classNames("row action", { hover: isRowHovered }), key: `action-${i}`, style: { height: ROW_HEIGHT }}, icons);
        };
        return rows.map(generator);
    }
    getRowIndex(y) {
        var rowIndex = -1; // -1 means header
        // Not in the header
        if (y > HEADER_HEIGHT) {
            rowIndex = Math.floor((y - HEADER_HEIGHT) / ROW_HEIGHT);
        }
        return rowIndex;
    }
    getActionIndex(x, headerWidth) {
        const { actions } = this.props;
        return Math.floor((x - headerWidth) / ACTION_WIDTH);
    }
    getColumnIndex(x, headerWidth) {
        if (x >= headerWidth)
            return -1;
        const { columns } = this.props;
        var columnIndex = 0;
        while ((x -= columns[columnIndex].width) > 0)
            columnIndex++;
        return columnIndex;
    }
    getHeaderWidth(columns) {
        return columns.reduce((a, b) => a + b.width, 0);
    }
    onClick(x, y, part) {
        const { columns, rows, actions } = this.props;
        if (part === scroller_1.Scroller.TOP_RIGHT_CORNER)
            return;
        const headerWidth = this.getHeaderWidth(columns);
        var columnIndex = this.getColumnIndex(x, headerWidth); // -1 means right gutter
        var rowIndex = this.getRowIndex(y); // -1 means header
        if (part === scroller_1.Scroller.RIGHT_GUTTER) {
            let action = actions[this.getActionIndex(x, headerWidth)];
            if (action) {
                this.onActionClick(action, rows[rowIndex]);
                return;
            }
        }
        // Header
        if (part === scroller_1.Scroller.TOP_GUTTER) {
            this.onHeaderClick(columns[columnIndex]);
            return;
        }
        this.onCellClick(rows[rowIndex], columns[columnIndex]);
    }
    onCellClick(row, column) {
        if (this.props.onRowClick && row) {
            this.props.onRowClick(row);
        }
    }
    onHeaderClick(column) {
        this.setState({
            sortColumn: column,
            sortAscending: this.state.sortColumn === column ? !this.state.sortAscending : true
        });
    }
    onActionClick(action, row) {
        action.callback(row);
    }
    onMouseMove(x, y, part) {
        const { rows, columns } = this.props;
        const headerWidth = this.getHeaderWidth(columns);
        var rowIndex = this.getRowIndex(y);
        this.setState({
            hoveredRowIndex: rowIndex > rows.length ? undefined : rowIndex,
            hoveredActionIndex: part === scroller_1.Scroller.RIGHT_GUTTER ? this.getActionIndex(x, headerWidth) : undefined
        });
    }
    onMouseLeave() {
        this.setState({
            hoveredRowIndex: undefined,
            hoveredActionIndex: undefined
        });
    }
    render() {
        const { columns, rows, actions } = this.props;
        const { sortColumn, sortAscending, hoveredRowIndex } = this.state;
        if (!columns)
            return null;
        return React.createElement("div", {className: dom_1.classNames("simple-table", { clickable: hoveredRowIndex !== undefined })}, React.createElement(scroller_1.Scroller, {ref: "scroller", layout: this.getLayout(columns, rows, actions), topRightCorner: React.createElement("div", null), topGutter: this.renderHeaders(columns, sortColumn, sortAscending), rightGutter: this.renderActions(rows, actions), body: this.renderRows(rows, columns, sortColumn, sortAscending), onClick: this.onClick.bind(this), onMouseMove: this.onMouseMove.bind(this), onMouseLeave: this.onMouseLeave.bind(this)}));
    }
}
exports.SimpleTable = SimpleTable;
