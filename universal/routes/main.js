export default () => {
    var mainRoutes = FlowRouter.group({
        prefix: "/user",
        triggersEnter: [
            (ctx, redirect) => {
                var route;
                if (!(Meteor.loggingIn() || Meteor.userId())) {
                    route = FlowRouter.current();
                    if (route.route.name !== "login") {
                        Session.set("redirectAfterLogin", route.path);
                    }
                    redirect("/sign-in");
                } else if (Roles.userIsInRole(Meteor.userId(), "organization", "Reserved")) {
                    redirect("/organization/dashboard");
                }
            }
        ]
    });

    mainRoutes.route("/dashboard", {
        action() {
            BlazeLayout.render("layout", {
                content: "dashboard",
                nav: "userNav"
            });
        },
        name: "dashboard"
    });

    mainRoutes.route("/account-settings", {
        action() {
            BlazeLayout.render("layout", {
                content: "accountSettings",
                nav: "userNav"
            });
        },
        name: "accountSettings"
    });


    mainRoutes.route("/request-credits", {
        action() {
            BlazeLayout.render("layout", {
                content: "requestCredits",
                nav: "userNav"
            });
        },
        name: "requestCredits"
    });
};