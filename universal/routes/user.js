export default () => {
    var userRoutes = FlowRouter.group({
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
                } else if (Roles.userIsInRole(Meteor.userId(), "organization")) {
                    redirect("/organization/dashboard");
                }
            }
        ]
    });

    userRoutes.route("/dashboard", {
        action() {
            BlazeLayout.render("layout", {
                content: "dashboard",
                nav: "userNav"
            });
        },
        name: "dashboard"
    });

    userRoutes.route("/account-settings", {
        action() {
            BlazeLayout.render("layout", {
                content: "accountSettings",
                nav: "userNav"
            });
        },
        name: "accountSettings"
    });


    userRoutes.route("/request-credits", {
        action() {
            BlazeLayout.render("layout", {
                content: "requestCredits",
                nav: "userNav"
            });
        },
        name: "requestCredits"
    });

    userRoutes.route("/redeem-credits", {
        subscriptions() {
            this.register("items", Meteor.subscribe("items"));
        },
        action() {
            BlazeLayout.render("layout", {
                content: "redeemCredits",
                nav: "userNav"
            });
        },
        name: "redeemCredits"
    });
};