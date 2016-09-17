export default () => {
    var adminRoutes = FlowRouter.group({
        prefix: "/admin",
        triggersEnter: [
            (ctx, redirect) => {
                var route;
                if (!(Meteor.loggingIn() || Meteor.userId())) {
                    route = FlowRouter.current();
                    if (route.route.name !== "login") {
                        Session.set("redirectAfterLogin", route.path);
                    }
                    redirect("/sign-in");
                } else if (!Roles.userIsInRole(Meteor.userId(), "admin")) {
                    redirect("/user/dashboard");
                }
            }
        ],
        triggersExit: [
            () => {
                $("body").css("padding-top", "");
            }
        ]
    });

    adminRoutes.route("/items", {
        action() {
            BlazeLayout.render("adminDashboard", {
                content: "itemsPage",
                attr: {title: "Sponsor Items"}
            });
        },
        name: "adminItems"
    });

    adminRoutes.route("/organizations", {
        action() {
            BlazeLayout.render("adminDashboard", {
                content: "organizationsPage",
                attr: {title: "Organizations"}
            });
        },
        name: "adminOrganizations"
    });

};