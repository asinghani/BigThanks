export default () => {
    var organizationRoutes = FlowRouter.group({
        prefix: "/organization",
        triggersEnter: [
            (ctx, redirect) => {
                var route;
                if (!(Meteor.loggingIn() || Meteor.userId())) {
                    route = FlowRouter.current();
                    if (route.route.name !== "login") {
                        Session.set("redirectAfterLogin", route.path);
                    }
                    redirect("/sign-in");
                } else if (!Roles.userIsInRole(Meteor.userId(), "organization")) {
                    redirect("/user/dashboard");
                } else {
                    $("body").css("padding-top", 0);
                }
            }
        ],
        triggersExit: [
            () => {
                $("body").css("padding-top", "");
            }
        ]
    });

    organizationRoutes.route("/dashboard", {
        action() {
            BlazeLayout.render("fullWidthLayout", {
                content: "organizationDashboard",
                nav: "organizationNav"
            });
        },
        name: "organizationDashboard"
    });

    organizationRoutes.route("/account-settings", {
        action() {
            BlazeLayout.render("fullWidthLayout", {
                content: "accountSettingsOrganization",
                nav: "organizationNav"
            });
        },
        name: "accountSettings"
    });

    organizationRoutes.route("/opportunities", {
        action() {
            BlazeLayout.render("fullWidthLayout", {
                content: "organizationOpportunities",
                nav: "organizationNav"
            });
        },
        name: "organizationOpportunities"
    });
}