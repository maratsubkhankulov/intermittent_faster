directory.LogView = Backbone.View.extend({
    initialize: function() {
        this.listenTo(this.model, 'add', this.addOne);
        this.listenTo(this.model, 'remove', this.render);
        this.listenTo(this.model, 'sort', this.render);
    },
    
    render: function () {
        this.$el.html(this.template());

        //For use with in-memory model
        var now = moment();
        _.each(this.model.models, function (entry) {
            // Render results only for this day
            if (moment(entry.get('datetime')).startOf('day').diff(now.startOf('d'),'day') == 0) {
                this.addOne(entry);
            }
        }, this);

        return this;
    },

    addOne: function(entry) {
        var view = new directory.LogEntryView({model: entry});
        $("#log-list", this.$el).append(view.render().el);
    }
});
