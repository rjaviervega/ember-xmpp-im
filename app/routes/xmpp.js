import Ember from 'ember';

export default Ember.Route.extend({

	model: function() {
		return this.store.peekAll('presence');
	},

    setupController: function(controller, model) {
        this._super();
        controller.set('dsRosterArray', model);
    }

});
