var directory = {
    
    views: {},

    models: {},

    loadTemplates: function(views, callback) {

        var deferreds = [];

        $.each(views, function(index, view) {
            if (directory[view]) {
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    directory[view].prototype.template = _.template(data);
                }, 'html'));
            } else {
                alert(view + " not found");
            }
        });

        $.when.apply(null, deferreds).done(callback);
    }
};

directory.Controller = function() {

    this._signups = new directory.SignupCollection();
    this._isLoggedIn = false;
    this._username = "Guest";
    this._currentUid = "guest";
    this._email = "";

    this.getCurrentUserId = function() {
        return this._currentUid;
    }

    this.getUsername = function() {
        return this._username;
    }

    this.getEmail = function() {
        return this._email;
    }

    this.getStarted = function(email) {
        this._email = email;
        this._signups.create({"email": email});
        ga('send', 'event', 'SignupBtn', 'click', 'Landing page');
        directory.router.navigate("#login", { trigger: true });
    }

    this.setUsername = function(username) {
        this._username = username;
    }

    this.setLoggedIn = function(isLoggedIn) {
        this._isLoggedIn = isLoggedIn;
    }

    this.isLoggedIn = function() {
        return this._isLoggedIn;
    }

    this.login = function(username, password, callback) {
        console.log("Controller: login");
        var myself = this;
        directory.authWithPassword(
            username,
            password,
            function(error, authData) {
              if (error) {
                console.log("Login Failed!", error);
                callback(error);
                ga('send', 'event', 'Login', 'click', 'Failed');
              } else {
                myself.setLoggedIn(true);
                myself.setUsername(username);
                myself._currentUid = authData.uid;
                console.log("Authenticated successfully with payload:", authData);
                directory.router.navigate("#home", { trigger: true });
                directory.shellView.update();
                ga('send', 'event', 'Login', 'click', 'Successful');
              }
            }
        );
    }

    this.register = function(username, password, callback) {
        var myself = this;
        directory.createUser(
            username,
            password,
            function(error, userData) {
                if (error) {
                    console.log("Error creating user:", error);
                    callback(error);
                    ga('send', 'event', 'Registration', 'click', 'Failed');
                } else {
                    myself.login(username, password, callback);
                    ga('send', 'event', 'Registration', 'click', 'Successful');
                }
            }
        );
    }

    this.logout = function() {
        this.setLoggedIn(false);
        this.setUsername("Guest");
        directory.unauth();
        directory.shellView.update();
    }
};

directory.Router = Backbone.Router.extend({

    routes: {
        "":                     "index",
        "landing":              "landing",
        "login":                "login",
        "demo":                 "demo",
        "home":                 "home",
    },

    initialize: function () {
        this.on('all', function(routeEvent) {
            //
        });
        directory.shellView = new directory.ShellView();
        $('body').html(directory.shellView.render().el);
        this.$content = $("#content");
    },

    index: function() {
        if (directory.controller.isLoggedIn()) {
            directory.router.navigate("home", { trigger: true } );
        } else {
            directory.router.navigate("landing", { trigger: true } );
        }
    },

    landing: function() {
        directory.landingView = new directory.LandingView();
        directory.landingView.render();
        this.$content.html(directory.landingView.el);
        ga('send', 'pageview', '/landing');
    },

    login: function() {
        directory.loginView = new directory.LoginOrRegisterView();
        directory.loginView.render();
        this.$content.html(directory.loginView.el);
        ga('send', 'pageview', '/login');
    },

    demo: function() {
        // Since the home view never changes, we instantiate it and render it only once
        if (!directory.demoView) {
            demoLogCollection = new directory.LogCollection([], {url: directory.firebaseAppUrl + "/logs/guest"});
            directory.demoView = new directory.HomeView({model: { demo: true, log: demoLogCollection }});
            directory.demoView.render();
        } else {
            console.log('reusing home view');
            directory.demoView.delegateEvents(); // delegate events when the view is recycled
        }
        this.$content.html(directory.demoView.el);
        ga('send', 'pageview', '/demo');
    },

    home: function () {
        if (!directory.controller.isLoggedIn()) {
            directory.router.navigate("#demo", { trigger: true });
            return;
        }

        var newLogPath = directory.firebaseAppUrl + "/logs/" + directory.controller.getCurrentUserId();
        logCollection = new directory.LogCollection([], {url: newLogPath});
        console.log(newLogPath);

        directory.homeView = new directory.HomeView({model: { demo: false, log: logCollection }});
        directory.homeView.render();
            
        this.$content.html(directory.homeView.el);
        ga('send', 'pageview', '/home');
    }
});

$(document).on("ready", function () {
    directory.controller = new directory.Controller();
    directory.checkLogin();
    directory.loadTemplates(
        [
        "HomeView",
        "ShellView",
        "StatsView",
        "LandingView",
        "LogView",
        "LogEntryView",
        "LoginOrRegisterView",
        "GraphView"
        ],
        function () {
			console.log("ready!");
            directory.router = new directory.Router();
            Backbone.history.start();
        });
});
