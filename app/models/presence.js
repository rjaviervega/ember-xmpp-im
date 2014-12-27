import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({

    _jid: DS.attr('string'),
    _ask: DS.attr('string'),
    _type: DS.attr('string'),

    //
    // XMPP Roster Subscription
    // ========================
    //
    // Source: http://xmpp.org/rfcs/rfc3921.html#int
    //
    // None -- the user does not have a subscription to the contact's presence information, and the contact does not have a subscription to the user's presence information
    // To -- the user has a subscription to the contact's presence information, but the contact does not have a subscription to the user's presence information
    // From -- the contact has a subscription to the user's presence information, but the user does not have a subscription to the contact's presence information
    // Both -- both the user and the contact have subscriptions to each other's presence information (i.e., the union of 'from' and 'to')
    //
    _subscription: DS.attr('string'),

    title: Ember.computed.alias('_jid'),
    badge: DS.attr('number'),
    status: DS.attr('string'),
    state: DS.attr('string'),
    active: DS.attr('boolean'),

    messages: DS.attr(),

    isLoggedUser: function() {
        return (!this.get('_subscription'));
    }.property('_subscription'),

    onlineStatus: function() {
        if (this.get('online')) {
            return 'online';
        }
        return 'offline';
    }.property('online'),

    online: function() {
        return (this.get('_type') !== 'unavailable' && this.get('state') !== 'offline' && this.get('state'));
    }.property('_type', 'state'),

    username: function() {
        return this.get('title').split('@')[0];
    }.property('title'),

    subscriptionStatus: function() {
        if (this.get('_subscription') === 'to') {
            return 'Following';
        }
        if (this.get('_subscription') === 'from') {
            return 'Follwer';
        }
        if (this.get('_subscription') === 'both') {
            return 'Connection';
        }
        if (this.get('_subscription') === 'none') {
            return 'Request sent, waiting for approval.';
        }
        if (!this.get('_subscription') && this.get('_type') !== 'subscribe') {
            return 'You';
        } else {
            return 'Subscribe received.';
        }
    }.property('_subscription'),

    isSubscribe: Ember.computed.equal('connectionType', 'subscribe'),

    isTo: Ember.computed.equal('connectionType', 'to'),

    displayAcceptDeny: Ember.computed.any('isSubscribe', 'isTo'),

    connectionType: function() {
        if (this.get('_subscription') === 'to') {
            return 'to';
        }
        if (this.get('_subscription') === 'from') {
            return 'from';
        }
        if (this.get('_subscription') === 'both') {
            return 'both';
        }
        if (this.get('_subscription') === 'none') {
            return 'none';
        }
        if (!this.get('_subscription') && this.get('_type') !== 'subscribe') {
            return 'self';
        }
        if (this.get('_type') === 'subscribe' && !this.get('_subscription')) {
            return 'subscribe';
        }
    }.property('_subscription', '_type')

});
