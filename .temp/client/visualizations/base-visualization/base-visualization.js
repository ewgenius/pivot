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
require('./base-visualization.css');
const React = require('react');
const plywood_1 = require('plywood');
const constants_1 = require('../../config/constants');
const loader_1 = require('../../components/loader/loader');
const query_error_1 = require('../../components/query-error/query-error');
class BaseVisualization extends React.Component {
    constructor() {
        super();
        this.lastRenderResult = null;
        this.state = this.getDefaultState();
        this.globalMouseMoveListener = this.globalMouseMoveListener.bind(this);
        this.globalMouseUpListener = this.globalMouseUpListener.bind(this);
        this.globalKeyDownListener = this.globalKeyDownListener.bind(this);
    }
    getDefaultState() {
        return {
            datasetLoad: {},
            scrollLeft: 0,
            scrollTop: 0,
            hoverMeasure: null
        };
    }
    // Way to get a static property without explicitly specifying the class
    get id() {
        return this.constructor.id;
    }
    onScroll(e) {
        var target = e.target;
        this.setState({
            scrollLeft: target.scrollLeft,
            scrollTop: target.scrollTop
        }); // Geez, TypeScript
    }
    makeQuery(essence) {
        var { splits, colors, dataCube } = essence;
        var measures = essence.getEffectiveMeasures();
        var $main = plywood_1.$('main');
        var query = plywood_1.ply()
            .apply('main', $main.filter(essence.getEffectiveFilter(this.id).toExpression()));
        measures.forEach((measure) => {
            query = query.performAction(measure.toApplyAction());
        });
        function makeSubQuery(i) {
            var split = splits.get(i);
            var splitDimension = dataCube.getDimensionByExpression(split.expression);
            var { sortAction, limitAction } = split;
            if (!sortAction) {
                throw new Error('something went wrong during query generation');
            }
            var subQuery = $main.split(split.toSplitExpression(), splitDimension.name);
            if (colors && colors.dimension === splitDimension.name) {
                var havingFilter = colors.toHavingFilter(splitDimension.name);
                if (havingFilter) {
                    subQuery = subQuery.performAction(havingFilter);
                }
            }
            measures.forEach((measure) => {
                subQuery = subQuery.performAction(measure.toApplyAction());
            });
            var applyForSort = essence.getApplyForSort(sortAction);
            if (applyForSort) {
                subQuery = subQuery.performAction(applyForSort);
            }
            subQuery = subQuery.performAction(sortAction);
            if (colors && colors.dimension === splitDimension.name) {
                subQuery = subQuery.performAction(colors.toLimitAction());
            }
            else if (limitAction) {
                subQuery = subQuery.performAction(limitAction);
            }
            else if (splitDimension.kind === 'number') {
                // Hack: Plywood converts groupBys to topN if the limit is below a certain threshold.  Currently sorting on dimension in a groupBy query does not
                // behave as expected and in the future plywood will handle this, but for now add a limit so a topN query is performed.
                // 5000 is just a randomly selected number that's high enough that it's not immediately obvious that there's a limit.
                subQuery = subQuery.limit(5000);
            }
            if (i + 1 < splits.length()) {
                subQuery = subQuery.apply(constants_1.SPLIT, makeSubQuery(i + 1));
            }
            return subQuery;
        }
        return query.apply(constants_1.SPLIT, makeSubQuery(0));
    }
    fetchData(essence) {
        var { registerDownloadableDataset } = this.props;
        let query = this.makeQuery(essence);
        this.precalculate(this.props, { loading: true });
        essence.dataCube.executor(query, { timezone: essence.timezone })
            .then((dataset) => {
            if (!this._isMounted)
                return;
            this.precalculate(this.props, {
                loading: false,
                dataset: dataset,
                error: null
            });
        }, (error) => {
            if (registerDownloadableDataset)
                registerDownloadableDataset(null);
            if (!this._isMounted)
                return;
            this.precalculate(this.props, {
                loading: false,
                dataset: null,
                error: error
            });
        }).done(); // Not calling done() prevents potential error from being bubbled up
    }
    componentWillMount() {
        this.precalculate(this.props);
    }
    componentDidMount() {
        this._isMounted = true;
        var { essence } = this.props;
        this.fetchData(essence);
        window.addEventListener('keydown', this.globalKeyDownListener);
        window.addEventListener('mousemove', this.globalMouseMoveListener);
        window.addEventListener('mouseup', this.globalMouseUpListener);
    }
    componentWillReceiveProps(nextProps) {
        this.precalculate(nextProps);
        var { essence } = this.props;
        var nextEssence = nextProps.essence;
        if (nextEssence.differentDataCube(essence) ||
            nextEssence.differentEffectiveFilter(essence, this.id) ||
            nextEssence.differentEffectiveSplits(essence) ||
            nextEssence.differentColors(essence) ||
            nextEssence.newEffectiveMeasures(essence)) {
            this.fetchData(nextEssence);
        }
    }
    componentWillUnmount() {
        this._isMounted = false;
        window.removeEventListener('keydown', this.globalKeyDownListener);
        window.removeEventListener('mousemove', this.globalMouseMoveListener);
        window.removeEventListener('mouseup', this.globalMouseUpListener);
    }
    globalMouseMoveListener(e) { }
    globalMouseUpListener(e) { }
    globalKeyDownListener(e) { }
    renderInternals() {
        return null;
    }
    precalculate(props, datasetLoad = null) {
    }
    render() {
        let { datasetLoad } = this.state;
        if (!datasetLoad.loading || !this.lastRenderResult) {
            this.lastRenderResult = this.renderInternals();
        }
        return React.createElement("div", {className: 'base-visualization ' + this.id}, this.lastRenderResult, datasetLoad.error ? React.createElement(query_error_1.QueryError, {error: datasetLoad.error}) : null, datasetLoad.loading ? React.createElement(loader_1.Loader, null) : null);
    }
}
BaseVisualization.id = 'base-visualization';
exports.BaseVisualization = BaseVisualization;
