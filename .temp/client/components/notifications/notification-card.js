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
require('./notification-card.css');
const React = require('react');
const dom_1 = require('../../utils/dom/dom');
const notifications_1 = require('./notifications');
class NotificationCard extends React.Component {
    constructor() {
        super();
        this.state = { appearing: false, disappearing: false };
    }
    componentDidMount() {
        this.setState({ appearing: true }, () => {
            this.timeoutID = window.setTimeout(this.appear.bind(this), 10);
        });
    }
    appear() {
        const { title, message, sticky } = this.props.model;
        if (sticky) {
            this.setState({ appearing: false });
            return;
        }
        this.setState({ appearing: false }, () => {
            this.timeoutID = window.setTimeout(this.disappear.bind(this), title && message ? 2000 : 1000);
        });
    }
    disappear() {
        this.setState({ disappearing: true }, () => {
            this.timeoutID = window.setTimeout(this.removeMe.bind(this, this.props.model), 200);
        });
    }
    removeMe(notification) {
        if (this.timeoutID !== undefined)
            window.clearTimeout(this.timeoutID);
        notifications_1.Notifier.removeNotification(notification);
    }
    componentWillUnmount() {
        if (this.timeoutID !== undefined)
            window.clearTimeout(this.timeoutID);
    }
    render() {
        const { appearing, disappearing } = this.state;
        var { model, top } = this.props;
        if (!model)
            return null;
        if (appearing || disappearing)
            top = -100;
        const height = model.title && model.message ? 60 : 30;
        return React.createElement("div", {style: { top: top, height: height }, onClick: this.disappear.bind(this), className: dom_1.classNames(`notification-card ${model.priority}`, { appearing: appearing, disappearing: disappearing })}, React.createElement("div", {className: "title"}, model.title), React.createElement("div", {className: "message"}, model.message));
    }
}
exports.NotificationCard = NotificationCard;
