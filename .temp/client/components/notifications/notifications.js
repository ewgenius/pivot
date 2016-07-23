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
require('./notifications.css');
const React = require('react');
const body_portal_1 = require('../body-portal/body-portal');
const notification_card_1 = require('./notification-card');
class Notifier {
    static create(notification) {
        notification.id = Notifier.counter++;
        Notifier.notifications.push(notification);
        Notifier.listeners.forEach((cb) => cb(Notifier.notifications));
    }
    static info(title, message) {
        Notifier.create({ title: title, message: message, priority: 'info' });
    }
    static failure(title, message) {
        Notifier.create({ title: title, message: message, priority: 'failure' });
    }
    static success(title, message) {
        Notifier.create({ title: title, message: message, priority: 'success' });
    }
    static subscribe(callback) {
        Notifier.listeners.push(callback);
    }
    static removeNotification(notification) {
        const index = Notifier.notifications.indexOf(notification);
        if (index === -1) {
            throw new Error('Trying to remove an unknown notification');
        }
        Notifier.notifications.splice(index, 1);
        Notifier.listeners.forEach((cb) => cb(Notifier.notifications));
    }
    static unsubscribe(callback) {
        const index = Notifier.listeners.indexOf(callback);
        if (index === -1) {
            throw new Error('Trying to unsubscribe something that never subscribed');
        }
        Notifier.listeners.splice(index, 1);
    }
}
Notifier.counter = 0;
Notifier.notifications = [];
Notifier.listeners = [];
exports.Notifier = Notifier;
class Notifications extends React.Component {
    constructor() {
        super();
        this.state = { notifications: [] };
        this.onChange = this.onChange.bind(this);
    }
    componentDidMount() {
        Notifier.subscribe(this.onChange);
    }
    componentWillUnmount() {
        Notifier.unsubscribe(this.onChange);
    }
    onChange(notifications) {
        this.setState({ notifications: notifications });
    }
    renderCards() {
        var cumuledHeight = 0;
        return this.state.notifications.map((n, i) => {
            var top = cumuledHeight;
            if (n.title && n.message) {
                cumuledHeight += 60 + 5;
            }
            else {
                cumuledHeight += 30 + 5;
            }
            return React.createElement(notification_card_1.NotificationCard, {model: n, key: n.id, top: top});
        });
    }
    render() {
        return React.createElement(body_portal_1.BodyPortal, {left: '50%', top: '10px'}, React.createElement("div", {className: "notifications"}, this.renderCards()));
    }
}
exports.Notifications = Notifications;
