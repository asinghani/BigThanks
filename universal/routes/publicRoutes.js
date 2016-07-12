export default function () {
    var publicRoutes = FlowRouter.group({});
    publicRoutes.route("/", {
        action() {
            BlazeLayout.render("layout", {
                content: "home",
                nav: "nav"
            });
        },
        name: "home"
    });

    publicRoutes.route("/logged-out", {
        action() {
            BlazeLayout.render("layout", {
                content: "home",
                nav: "nav",
                extra: "loggedOutModal"
            });
        },
        name: "home2"
    });

    publicRoutes.route("/help", {
        action() {
            BlazeLayout.render("layout", {
                content: "help",
                nav: "nav"
            });
        },
        name: "help"
    });
}