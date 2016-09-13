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
                attr: {
                    title: "Dashboard"
                }
            });
        },
        name: "dashboard"
    });

    userRoutes.route("/account-settings", {
        action() {
            BlazeLayout.render("layout", {
                content: "accountSettings",
                attr: {
                    title: "Account Settings"
                }
            });
        },
        name: "accountSettings"
    });


    userRoutes.route("/request-credits", {
        action() {
            BlazeLayout.render("layout", {
                content: "requestCredits",
                attr: {
                    title: "Request Credit Validation",
                    subtitle: "After volunteering, the organizer of the volunteer opportunity will validate your credits."
                }
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
                attr: {
                    title: "Redeem Credits",
                    subtitle: "Purchase e-vouchers, coupons, etc. using credits"
                }
            });
        },
        name: "redeemCredits"
    });
};