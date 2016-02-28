import Ember from 'ember';

export default Ember.Component.extend({

    xmpp: Ember.inject.service(),

    // Logged user's jabber id
    jid: null,

    // Connection flag
    isConnected: false,

    // Stores user's presence objects from Roster and presence updates
    dsRosterArray: null,

    // User record selected for chat
    activeRecord: null,

    // Display chat flag
    showChatWindow: false,

    // Current messages record for selected user
    activeThread: null,

    // Editing presence flag
    editingStatus: false,

    selfPresence: function() {
        return this.get('dsRosterArray').filterBy('id', this.get('jid'));
    }.property('dsRosterArray.@each'),

    isLoggedUser: function() {
        return (this.get('activeRecord.id') === this.get('jid'));
    }.property('activeRecord'),

    didInsertElement: function() {
        this._super();
    },

    newMessageObject: function(msgObject) {
        msgObject.from = this.get('jid') ;
        msgObject.to = this.get('activeRecord').get('id');

        if (msgObject.from === this.get('jid')) {
            msgObject.alignment = 'from';
            msgObject.alignmentFrom = true;
        } else {
            msgObject.alignment = 'to';
            msgObject.alignmentTo = true;
        }
        return this.get('store').createRecord('message', msgObject);
    },

    updateScroll: function() {
        var e = $('.chat-text-box');

        Ember.run.debounce(function() {
            if (e && e.length > 0) {
                e.animate({scrollTop: e[0].scrollHeight}, 200);
            }
        }, 100);
    }.observes('activeThread.messages.@each'),

    onUpdateUndefinedMessages: function() {
        if (!this.get('activeThread')) {
            if (this.get('activeRecord')) {
                this.set('activeThread', this.get('activeRecord.messages'));
            }
        }
    }.observes('activeRecord.badge'),

    actions: {
        updatePresence: function(presenceStatus) {
            var connection = this.get('connection');
            connection.send($pres({status: presenceStatus, state: 'online'}));
        },

        selectUser: function(record) {
            if (this.get('activeRecord') && !this.get('activeRecord').isDestroyed) {
                this.get('activeRecord').set('active', false);
            }
            record.set('badge', 0);
            var m, m2;
            m = this.get('xmpp.messages').findBy('id', record.id);

            if (!m) {
                this.get('xmpp.messages').pushObject({
                    id: record.id,
                    messages: []
                });
                m = this.get('xmpp.messages').findBy('id', record.id);
            }

            this.set('activeRecord', record);
            this.set('activeThread', m);

            if (this.get('activeRecord')) {
                record.set('active', true);
            }

            this.set('editingStatus', false);

            this.set('showChatWindow', true);

            Ember.run.later(function() {
                $('#chatInput').focus();
            });

        },

        sendChat: function() {
            var connection = this.get('connection'),
                message = this.get('messageText'),
                activeThread = this.get('activeThread'),
                from = this.get('jid'),
                to =  this.get('activeRecord').get('id'),
                reply = null;

            reply = $msg({to: to, from: from, type: 'chat'}).c('body', null, message);

            connection.send(reply.tree());

            if (!activeThread) {
                this.get('xmpp.messages').pushObject({
                    id: to,
                    messages: []
                });
                activeThread = this.get('xmpp.messages').findBy('id', to);
                this.set('activeThread', activeThread);
            }

            Ember.get(activeThread, 'messages').pushObject(this.newMessageObject({body: message}));

            this.set('activeThread', activeThread);

            this.get('activeRecord').set('messages', activeThread);

            this.set('messageText');

            $('#chatInput').focus();
        },

        removeUserFromRoster: function(user) {
            var connection = this.get('connection');
            if (confirm('Are you sure you want to remove this user?')) {
                connection.sendIQ($iq({from: this.get('jid'), type:'set'})
                    .c('query', { xmlns: 'jabber:iq:roster' })
                    .c('item', { jid: user.get('_jid'), subscription: 'remove' })
                );
                user.deleteRecord();
            }
        },

        acceptSubscribeRequest: function(user) {
            var connection = this.get('connection');
            connection.send($pres({to: user.get('_jid'), 'type': 'subscribed'}));
            connection.send($pres({to: user.get('_jid'), 'type': 'subscribe'}));
        },

        denySubscribeRequest: function(user) {
            var connection = this.get('connection');
            connection.send($pres({to: user.get('_jid'), 'type': 'unsubscribe'}));
            user.deleteRecord();
        },

        closeChatWindow: function() {
            this.set('showChatWindow', false);
            this.set('editingStatus', false);
            if (this.get('activeRecord')) {
                this.get('activeRecord').set('active', false);
            }
        },

        editStatus: function() {
            this.set('editingStatus', true);
        },

        editStatusOk: function(user) {
            this.set('editingStatus', false);
            this.send('updatePresence', user.get('status'));
        },

        editStatusCancel: function() {
            this.set('editingStatus', false);
        }

    }
});
