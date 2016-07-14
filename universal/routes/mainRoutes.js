export default function () {
    var mainRoutes = FlowRouter.group({
        triggersEnter: [
            () => {
                var route;
                if (!(Meteor.loggingIn() || Meteor.userId())) {
                    route = FlowRouter.current();
                    if (route.route.name !== "login") {
                        Session.set("redirectAfterLogin", route.path);
                    }
                    return FlowRouter.go("/sign-in");
                }
            }
        ]
    });

    mainRoutes.route("/dashboard", {
        action() {
            BlazeLayout.render("layout", {
                content: "dashboard",
                nav: "nav"
            });
        },
        name: "dashboard"
    });

    mainRoutes.route("/account-settings", {
        action() {
            BlazeLayout.render("layout", {
                content: "accountSettings",
                nav: "nav"
            });
        },
        name: "accountSettings"
    });
}