import Ember from 'ember';
import environment from '../config/environment';

export default Ember.Controller.extend({

	// BOSH server URL
	xmmpBoshServer: environment.xmppConfig.xmmpBoshServer,

	// Default user jid to login (used for demo)
	jid: environment.xmppConfig.xmppDefaultUser,

	// Default user password to login (used for demo)
	password: environment.xmppConfig.xmppDefaultPass,

	debugginOn: environment.xmppConfig.debugginOn,

	// XMPP XML Raw input data
	inputData: null,

	// XMPP XML Raw output data
	outputData: null,

	// XMPP connection handler
	connection: null,

	// XMPP Connection flag
	isConnected: false,

	// Connection to xmpp error
	connectionError: null,

	//
	// onConnect function gets called by Strophe.js every time
	// the connection status changes.
	//
	onConnect: function(status) {
		var _this = this,
			connection = null;

		// Default statue to disconnected
		this.set('isConnected', false);

	    if (status === Strophe.Status.CONNECTING) {
	    	if (this.get('debugginOn')) {
				console.log('Strophe is connecting.');
			}
	    } else if (status === Strophe.Status.ERROR) {
	    	if (this.get('debugginOn')) {
				console.log('Strophe failed to authenticate.');
			}
			this.set('connectionError', 'Connection error.');
	    } else if (status === Strophe.Status.AUTHFAIL) {
	    	if (this.get('debugginOn')) {
				console.log('Strophe failed to authenticate.');
			}
			this.set('connectionError', 'Authentication to xmpp server failed.');
	    } else if (status === Strophe.Status.CONNFAIL) {
	    	if (this.get('debugginOn')) {
				console.log('Strophe failed to connect.');
			}
			this.set('connectionError', 'Connection to xmpp server failed.');
	    } else if (status === Strophe.Status.DISCONNECTING) {
	    	if (this.get('debugginOn')) {
				console.log('Strophe is disconnecting.');
			}
	    } else if (status === Strophe.Status.DISCONNECTED) {
	    	if (this.get('debugginOn')) {
				console.log('Strophe is disconnected.');
			}
			this.set('connectionError', '');
	    } else if (status === Strophe.Status.CONNECTED) {

	    	if (this.get('debugginOn')) {
	    		console.log('Strophe is connected.');
	    	}

	    	this.set('connectionError', '');

	    	connection = this.get('connection');

	    	// Hook to hanlder on message events
			connection.addHandler(this.onMessage.bind(this));

			// Send empty presence message
			connection.send($pres({}));

			// Update presence message with active status
			connection.send($pres({status: 'logged in', state: 'online'}));

			// Request XMPP Roaster
			connection.sendIQ($iq({type:'get'}).c('query', { xmlns: 'jabber:iq:roster' }));

			// Bind disconnect event on unloading document
	        $(window).on('beforeunload', function() {
	            _this.send('disconnect');
	        });

	        this.set('isConnected', true);
	    }
	},

	// Display XMPP Input messages
	rawInput: function(data) {
		this.set('inputData', data);
	},

	// Display XMPP Output messages
	rawOutput: function(data) {
		this.set('outputData', data);
	},

	//
	// TODO: Break down the process messages logic into
	// smaller function calls or implement a hook-pattern.
	//
	onMessage: function(message) {
		var x2js = new X2JS(),
			_this = this,
			messageJSON = x2js.xml2json(message),
			messageJSONOutter = x2js.xml_str2json(message.outerHTML),
			messages,
			badge,
		 	to,
		 	body,
		 	p,
		 	msg,
		 	record,
		 	bareJid;

		 if (this.get('debugginOn')) {
			console.log(messageJSONOutter);
		}

		//
		// Process roster messages (Add user presence to our list)
		//
		if (messageJSON && messageJSON.query && messageJSON.query.item) {
			if (Array.isArray(messageJSON.query.item)) {
				this.updateRosterRecord(messageJSON.query.item);
			} else {
				if (messageJSON.query.item._subscription !== 'remove' && messageJSON.query.item._ask !== "unsubscribe") {
					this.updateRosterRecord([messageJSON.query.item]);
				}
			}
		}

		//
		// Presence Update Messages
		//
		// Find the presence record and create or update
		// with new data. Presence records are stored by id
		// which is the first part of the user JID.
		//
		if (messageJSONOutter.presence) {

			// Obtain presence id
			// We use bare jid to store presence
			bareJid = messageJSONOutter.presence._from.split('/')[0];

			// Presence object
			p = { id: bareJid, _jid: messageJSONOutter.presence._from };

			if (messageJSONOutter.presence._status) {
				p.status = messageJSONOutter.presence._status;
			}

			if (messageJSONOutter.presence._state) {
				p.state = messageJSONOutter.presence._state;
			}

			p._type = messageJSONOutter.presence._type;

			record = this.get('store').getById('presence', bareJid);

			if (record) {
				record.set('status', p.status);
				record.set('state', p.state);
				record.set('_type', p._type);
			} else {
				this.get('store').createRecord('presence', p);
			}
		}

		//
		// Chats Messages
		//
		if (messageJSONOutter.message) {

			bareJid = messageJSONOutter.message._from.split('/')[0];
			to = messageJSONOutter.message._to.split('/')[0];
			body = messageJSONOutter.message.body;

			msg = { from: bareJid, to: to, body: body };

			if (msg.from === this.get('jid')) {
				msg.alignment = 'from';
			} else {
				msg.alignment = 'to';
			}

			record = this.get('store').getById('presence', bareJid);

			if (record) {
				if (!record.get('messages')) {
					record.set('messages', Ember.A());
				}
				messages = record.get('messages');
				messages.pushObject(_this.get('store').createRecord('message', msg));
				badge = record.get('badge') ? record.get('badge') : 0;
				record.set('badge', badge + 1);
			}
		}

		// We must return true for Strophe to continue to apply this function
		// after the first call.
		return true;
	},

	//
	// Update records obtain from querying the XMPP roster
	//
	updateRosterRecord: function(rosterArray) {
		var _this = this;

		rosterArray.forEach(function(item){
			item.id = item._jid;
			if (!_this.get('store').hasRecordForId('presence', item.id)) {
				_this.get('store').createRecord('presence', item);
			} else {
				_this.get('store').getById('presence', item.id).set('_subscription', item._subscription);
			}
		});
	},

	actions: {
		connect: function() {
			var connection;

			this.set('connectionError', '');

			if (Ember.isEmpty(this.get('jid')) || Ember.isEmpty(this.get('password'))) {
				this.set('connectionError', 'User Jid or password cannot be empty.');
				return;
			}

			if (this.get('jid').indexOf('@') < 0) {
				this.set('connectionError', 'User Jid needs to include a full domain.');
				return;
			}

			// Initiate Strophe XMPP connection
			//
			this.set('connection', new Strophe.Connection(this.get('xmmpBoshServer')));

			// Save connection object
			connection = this.get('connection');

			if (this.get('debugginOn')) {
				// Bind raw inputs
			    connection.rawInput  = this.rawInput.bind(this);
			    connection.rawOutput = this.rawOutput.bind(this);
			}

			// Connect to XMPP Server and bind connection call
		    connection.connect(this.get('jid'), this.get('password'), this.onConnect.bind(this));
		},

		updatePresence: function(presenceStatus) {
			var connection = this.get('connection');
			if (presenceStatus) {
				connection.send($pres({status: presenceStatus, state: 'online'}));
			}
		},

		subscribe: function() {
			var connection = this.get('connection');

			// Request subscribe & auto-subscibe to user
			//
			if (this.get('addJid')) {
				connection.send($pres({to: this.get('addJid'), "type": "subscribe"}));
				connection.send($pres({to: this.get('addJid'), "type": "subscribed"}));
			}
		},

		subscribed: function() {
			var connection = this.get('connection');
			if (this.get('acceptJid')) {
				connection.send($pres({to: this.get('acceptJid'), "type": "subscribed"}));
			}
		},

		roster: function() {
			var connection = this.get('connection');
			connection.sendIQ($iq({type:'get'}).c('query', { xmlns: 'jabber:iq:roster' }));
		},

		disconnect: function() {
			var connection = this.get('connection');

			this.set('connectionError', '');

			if (connection) {
				connection.disconnect();
			}

			connection = null;

			this.set('connection');
			this.get('store').unloadAll('presence');
		}
	}

});
