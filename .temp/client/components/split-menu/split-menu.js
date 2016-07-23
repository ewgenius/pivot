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
require('./split-menu.css');
const React = require("react");
const plywood_1 = require("plywood");
const index_1 = require("../../../common/utils/index");
const index_2 = require("../../../common/models/index");
const constants_1 = require("../../config/constants");
const dom_1 = require("../../utils/dom/dom");
const svg_icon_1 = require("../svg-icon/svg-icon");
const bubble_menu_1 = require("../bubble-menu/bubble-menu");
const dropdown_1 = require("../dropdown/dropdown");
const button_group_1 = require("../button-group/button-group");
function formatLimit(limit) {
    if (limit === 'custom')
        return 'Custom';
    return limit === null ? 'None' : String(limit);
}
class SplitMenu extends React.Component {
    constructor() {
        super();
        this.state = {
            split: null,
            colors: null
        };
        this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
    }
    componentWillMount() {
        var { essence, split } = this.props;
        var { dataCube, colors } = essence;
        var myColors = null;
        if (colors) {
            var colorDimension = dataCube.getDimension(colors.dimension);
            if (colorDimension.expression.equals(split.expression)) {
                myColors = colors;
            }
        }
        this.setState({
            split: split,
            colors: myColors
        });
    }
    componentDidMount() {
        window.addEventListener('keydown', this.globalKeyDownListener);
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this.globalKeyDownListener);
    }
    globalKeyDownListener(e) {
        if (dom_1.enterKey(e)) {
            this.onOkClick();
        }
    }
    onSelectGranularity(granularity) {
        var { split } = this.state;
        var bucketAction = split.bucketAction;
        this.setState({
            split: split.changeBucketAction(index_2.updateBucketSize(bucketAction, granularity))
        });
    }
    onSelectSortOn(sortOn) {
        var { split } = this.state;
        var sortAction = split.sortAction;
        var direction = sortAction ? sortAction.direction : plywood_1.SortAction.DESCENDING;
        this.setState({
            split: split.changeSortAction(new plywood_1.SortAction({
                expression: sortOn.getExpression(),
                direction: direction
            }))
        });
    }
    onToggleDirection() {
        var { split } = this.state;
        var { sortAction } = split;
        this.setState({
            split: split.changeSortAction(sortAction.toggleDirection())
        });
    }
    onSelectLimit(limit) {
        var { essence } = this.props;
        var { split } = this.state;
        var { colors } = essence;
        if (colors) {
            colors = index_2.Colors.fromLimit(colors.dimension, limit);
        }
        this.setState({
            split: split.changeLimit(limit),
            colors: colors
        });
    }
    onOkClick() {
        if (!this.actionEnabled())
            return;
        var { clicker, essence, onClose } = this.props;
        var { split, colors } = this.state;
        clicker.changeSplits(essence.splits.replace(this.props.split, split), index_2.VisStrategy.UnfairGame, colors);
        onClose();
    }
    onCancelClick() {
        var { onClose } = this.props;
        onClose();
    }
    getSortOn() {
        var { essence, dimension } = this.props;
        var { split } = this.state;
        return index_2.SortOn.fromSortAction(split.sortAction, essence.dataCube, dimension);
    }
    renderGranularityPicker(type) {
        var { split } = this.state;
        var { dimension } = this.props;
        var selectedGran = index_2.granularityToString(split.bucketAction);
        const granularities = dimension.granularities || index_2.getGranularities(type, dimension.bucketedBy);
        var buttons = granularities.map((g) => {
            const granularityStr = index_2.granularityToString(g);
            return {
                isSelected: granularityStr === selectedGran,
                title: index_1.formatGranularity(granularityStr),
                key: granularityStr,
                onClick: this.onSelectGranularity.bind(this, g)
            };
        });
        return React.createElement(button_group_1.ButtonGroup, {title: constants_1.STRINGS.granularity, groupMembers: buttons});
    }
    renderSortDropdown() {
        var { essence, dimension } = this.props;
        var sortOns = [index_2.SortOn.fromDimension(dimension)].concat(essence.dataCube.measures.toArray().map(index_2.SortOn.fromMeasure));
        const SortOnDropdown = dropdown_1.Dropdown.specialize();
        return React.createElement(SortOnDropdown, {label: constants_1.STRINGS.sortBy, items: sortOns, selectedItem: this.getSortOn(), equal: index_2.SortOn.equal, renderItem: index_2.SortOn.getTitle, keyItem: index_2.SortOn.getName, onSelect: this.onSelectSortOn.bind(this)});
    }
    renderSortDirection() {
        var { split } = this.state;
        var direction = split.sortAction.direction;
        return React.createElement("div", {className: "sort-direction"}, this.renderSortDropdown(), React.createElement("div", {className: 'direction ' + direction, onClick: this.onToggleDirection.bind(this)}, React.createElement(svg_icon_1.SvgIcon, {svg: require('../../icons/sort-arrow.svg')})));
    }
    renderLimitDropdown(includeNone) {
        var { essence } = this.props;
        var { split, colors } = this.state;
        var { limitAction } = split;
        var items = [5, 10, 25, 50, 100];
        var selectedItem = limitAction ? limitAction.limit : null;
        if (colors) {
            items = [3, 5, 7, 9, 10];
            selectedItem = colors.values ? 'custom' : colors.limit;
        }
        if (includeNone)
            items.unshift(null);
        const MyDropdown = dropdown_1.Dropdown.specialize();
        return React.createElement(MyDropdown, {label: constants_1.STRINGS.limit, items: items, selectedItem: selectedItem, renderItem: formatLimit, onSelect: this.onSelectLimit.bind(this)});
    }
    renderTimeControls() {
        return React.createElement("div", null, this.renderGranularityPicker('time'), this.renderSortDirection(), this.renderLimitDropdown(true));
    }
    renderNumberControls() {
        return React.createElement("div", null, this.renderGranularityPicker('number'), this.renderSortDirection(), this.renderLimitDropdown(true));
    }
    renderStringControls() {
        return React.createElement("div", null, this.renderSortDirection(), this.renderLimitDropdown(false));
    }
    actionEnabled() {
        var originalSplit = this.props.split;
        var originalColors = this.props.essence.colors;
        var newSplit = this.state.split;
        var newColors = this.state.colors;
        return !originalSplit.equals(newSplit) || (originalColors && !originalColors.equals(newColors));
    }
    render() {
        var { containerStage, openOn, dimension, onClose, inside } = this.props;
        var { split } = this.state;
        if (!dimension)
            return null;
        var menuSize = index_2.Stage.fromSize(250, 240);
        var menuControls = null;
        if (split.bucketAction instanceof plywood_1.TimeBucketAction) {
            menuControls = this.renderTimeControls();
        }
        else if (split.bucketAction instanceof plywood_1.NumberBucketAction) {
            menuControls = this.renderNumberControls();
        }
        else {
            menuControls = this.renderStringControls();
        }
        return React.createElement(bubble_menu_1.BubbleMenu, {className: "split-menu", direction: "down", containerStage: containerStage, stage: menuSize, openOn: openOn, onClose: onClose, inside: inside}, menuControls, React.createElement("div", {className: "button-bar"}, React.createElement("button", {className: "ok", onClick: this.onOkClick.bind(this), disabled: !this.actionEnabled()}, constants_1.STRINGS.ok), React.createElement("button", {className: "cancel", onClick: this.onCancelClick.bind(this)}, constants_1.STRINGS.cancel)));
    }
}
exports.SplitMenu = SplitMenu;
