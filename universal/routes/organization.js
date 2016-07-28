export default function () {
    var organizationRoutes = FlowRouter.group({
        prefix: "/organization",
        triggersEnter: [
            () => {
                var route;
                if (!(Meteor.loggingIn() || Meteor.userId())) {
                    route = FlowRouter.current();
                    if (route.route.name !== "login") {
                        Session.set("redirectAfterLogin", route.path);
                    }
                    redirect("/sign-in");
                } else if (!Roles.userIsInRole(Meteor.userId(), "organization", "Reserved")) {
                    redirect("/user/dashboard");
                }
            }
        ]
    });

    organizationRoutes.route("/dashboard", {
        action() {
            BlazeLayout.render("layout", {
                content: "dashboard",
                //nav: "nav"
            });
        },
        name: "dashboard"
    });

    organizationRoutes.route("/account-settings", {
        action() {
            BlazeLayout.render("layout", {
                content: "accountSettings",
                nav: "nav"
            });
        },
        name: "accountSettings"
    });


    organizationRoutes.route("/request-credits", {
        action() {
            BlazeLayout.render("layout", {
                content: "requestCredits",
                nav: "nav"
            });
        },
        name: "requestCredits"
    });
}