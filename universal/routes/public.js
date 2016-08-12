export default () => {
    var publicRoutes = FlowRouter.group({});
    publicRoutes.route("/", {
        action() {
            BlazeLayout.render("layout", {
                content: "home",
                nav: "publicNav"
            });
        },
        name: "home"
    });

    publicRoutes.route("/logged-out", {
        action() {
            BlazeLayout.render("layout", {
                content: "home",
                nav: "publicNav",
                extra: "loggedOutModal"
            });
        },
        name: "home2"
    });
    
    publicRoutes.route("/help", {
        action() {
            BlazeLayout.render("layout", {
                content: "help",
                nav: "publicNav"
            });
        },
        name: "help"
    });

    publicRoutes.route("/volunteer-opportunities", {
        action() {
            BlazeLayout.render("layout", {
                content: "volunteerOpportunities",
                nav: "publicNav"
            });
        },
        name: "volunteerOpportunities"
    });
}