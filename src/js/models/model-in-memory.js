directory.Entry = Backbone.Model.extend({
    initialize:function () {
    },

    sync: function(method, model, options) {
        if (method === "create") {
            console.log("Create: log entry in memory: " + model.toJSON());
            directory.store.logEntries.push(model.toJSON());
        }
    }
});

directory.EntryCollection = Backbone.Collection.extend({
    model: directory.Entry,

    initialize: function() {
        directory.store.load(this);
    },

    sync: function(method, model, options) {
        if (method === "read") {
            options.success(directory.store.logEntries);
        }
    },

    comparator: function(m) {
        return -moment(m.get('datetime'));
    }
});

directory.Day = Backbone.Model.extend({
    initialize:function () {
    },

    sync: function(method, model, options) {
        if (method === "read") {
            console.log("Get day: " + options.data.spanId + " " + options.data.date);
            directory.store.findDayByDateAndSpanId(this.id, function (data) {
                options.success(data);
            });
        }
    }
});

// Firebase specific utils - mocked
directory.authWithPassword = function(username, password, callback) {
    if (username === "admin") {
        return callback(null, { uid : "1234" });
    } else {
        return callback("Mock: incorrect username"); 
    }
}

directory.createUser = function(username, password, callback) {
    if (username === "admin") {
        return callback(null, { uid : "1234" });
    } else {
        return callback("Mock: incorrect username"); 
    }
}

directory.MemoryStore = function (successCallback, errorCallback) {

    this.load = function (log) {
        _.each(this.logEntries, function(entry) {
            log.create(entry);
        });
    }

    this.findById = function (id, callback) {
        var days = this.days;
        var day = null;
        var l = days.length;
        for (var i = 0; i < l; i++) {
            if (days[i].id === id) {
                day = days[i];
                break;
            }
        }
        callLater(callback, day);
    }

    this.findSpanById = function (id, callback) {
        var spans = this.spans;
        var span = null;
        var l = spans.length;
        for (var i = 0; i < l; i++) {
            if (spans[i].id === id) {
                span = spans[i];
                break;
            }
        }
        callLater(callback, span);
    }

    this.findDaysBySpanId = function (spanId, callback) {
        var days = this.days;
        var dayCollection = this.days.filter(function (element) {
            return spanId === element.spanId;
        });
        callLater(callback, dayCollection);
    }

    this.findDayByDateAndSpanId = function (dateAndSpanId, callback) {
        //console.log("Find day by date, spanId: " + dateAndSpanId[0]);
        var days = this.days;
        var day = null;
        var l = days.length;
        for (var i = 0; i < l; i++) {
            console.log("Comparing spanId: " + days[i].spanId + "=" + dateAndSpanId[0]);
            if (days[i].spanId === dateAndSpanId[0]) {
                //console.log("Comparing date strings: " + days[i].date + "=" + dateAndSpanId[1]);
                var date1 = directory.newDate(directory.formatDateStr(days[i].date));
                var date2 = directory.newDate(dateAndSpanId[1]);
                //console.log("Comparing date: " + date1 + "=" + date2);
                if (date1.getTime() == date2.getTime()) {
                    day = days[i];
                    break;
                }
            }
        }
        callLater(callback, day);
    }

    // Used to simulate async calls. This is done to provide a consistent interface with stores that use async data access APIs
    var callLater = function (callback, data) {
        if (callback) {
            setTimeout(function () {
                callback(data);
            });
        }
    }

    this.logEntries = [
        {"id": "4", "datetime": "2016-02-07T20:50:09.056Z", "comment": "Papa John's Pizza"},
        {"id": "2", "datetime": "2016-02-08T17:00:09.056Z", "comment": "Steamed tofu"},
        {"id": "7", "datetime": "2016-02-07T14:36:09.056Z", "comment": "Mixed grain salad"},
        {"id": "5", "datetime": "2016-02-08T10:00:09.056Z", "comment": "Coffee"}
    ];

    callLater(successCallback);
};

directory.store = new directory.MemoryStore();
