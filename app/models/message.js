import DS from 'ember-data';

export default DS.Model.extend({
    from: DS.attr('string'),
    to: DS.attr('string'),
    body: DS.attr('string'),
    alignment: DS.attr('string'),

    fromUsername: function() {
        return this.get('from').split('@')[0];
    }.property('from'),

    isSentMessage: function() {
        return (this.get('alignment') === 'from');
    }.property('alignment')
});
