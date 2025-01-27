export default () => {

    /**
     * Redirect user to page previously attempting to access after logging in (stored in "redirectAfterLogin" session variable)
     */
    Accounts.onLogin(() => {
        var redirect;
        redirect = Session.get("redirectAfterLogin");
        if (redirect != null) {
            if (redirect !== "/login") {
                return FlowRouter.go(redirect);
            }
        }
    });

    // Allow /sign-out route for links
    FlowRouter.route("/sign-out", {
        action() {
            Accounts.logout();
            FlowRouter.redirect("/sign-in");
        },
        name: "logout"
    });

    FlowRouter.route("/sign-in", {
        action() {
            BlazeLayout.render("signIn");
        },
        name: "signIn"
    });

    var routes = FlowRouter.group({
        triggersEnter: [
            (ctx, redirect) => {
                var route;
                if (!(Meteor.loggingIn() || Meteor.userId())) {
                    route = FlowRouter.current();
                    if (route.route.name !== "login") {
                        Session.set("redirectAfterLogin", route.path);
                    }
                    redirect("/sign-in");
                }
            }
        ]
    });

    routes.route("/dashboard", {
        action() {
            FlowRouter.redirect("/");
        },
        name: "dashboardAlt"
    });

    routes.route("/", {
        action() {
            BlazeLayout.render("dashboardNeedsLogin");
        },
        name: "dashboard"
    });
};