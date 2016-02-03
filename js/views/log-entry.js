directory.LogEntryView = Backbone.View.extend({
    
    tagName: "tr",
    
    render:function () {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});