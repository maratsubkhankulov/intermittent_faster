directory.HomeView = Backbone.View.extend({
    events: {
        "click #logMealBtn":"logMeal",
        "click #randomizeData":"randomizeData",
    },

    initialize: function() {
        this.statsView = new directory.StatsView({model: directory.logEntriesCollection});
        this.logView = new directory.LogView({model: directory.logEntriesCollection});
        this.graphView = new directory.GraphView({model: directory.logEntriesCollection});
    },

    render:function () {
        this.$el.html(this.template());

        $('#stats-el', this.$el).append(this.statsView.render().el);
        $('#log-el', this.$el).append(this.logView.render().el);
        $('#graph-el', this.$el).append(this.graphView.render().el);
        return this;
    },

    logMeal: function() {
        console.log("Log meal button pressed");
        var datetime = $("#datetimepicker", this.el).data("DateTimePicker").viewDate();
        var comment = $("#inputComment", this.el).val();
        var diffFromNow = moment(datetime).startOf('d').diff(moment().startOf('d'), 'd');
        if (diffFromNow == 0) {
            // go ahead
        } else if (diffFromNow > 0) {
            console.log("date can't be in the future");
            return;
        } else if (diffFromNow < 0) {
            console.log("date can't be in the past");
            return;
        }

        if (comment === "" || datetime === "") {
            console.log("one or more fields are empty");
            return;
        }
        console.log(datetime.toISOString());
        //Create a new log entry
        var entry = directory.logEntriesCollection.create({"datetime": datetime.toISOString(), "comment": comment});
        //Redraw graph
        this.graphView.updateGraph();
    }
});
