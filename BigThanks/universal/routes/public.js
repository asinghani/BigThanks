import { getNav, getLayout } from "../util/layout.js";

export default () => {
    var publicRoutes = FlowRouter.group({});
    publicRoutes.route("/", {
        action() {
            BlazeLayout.render("home");
        },
        name: "home"
    });

    publicRoutes.route("/features", {
        action() {
            BlazeLayout.render("publicLayout", {
                content: "features",
                attr: {
                    title: "Features",
                    subtitle: ""
                }
            });
        },
        name: "features"
    });

    publicRoutes.route("/sponsor", {
        action() {
            BlazeLayout.render("publicLayout", {
                content: "sponsor",
                attr: {
                    title: "Sponsor",
                    subtitle: ""
                }
            });
        },
        name: "sponsor"
    });

    publicRoutes.route("/organizations", {
        action() {
            BlazeLayout.render("publicLayout", {
                content: "organizations",
                attr: {
                    title: "Organizations",
                    subtitle: ""
                }
            });
        },
        name: "organizations"
    });

    publicRoutes.route("/contact", {
        action() {
            if(!Meteor.user() || Roles.userIsInRole(Meteor.user(), "admin")){
                BlazeLayout.render("publicLayout", {
                    content: "contact",
                    attr: {
                        title: "Contact Us"
                    }
                });
            } else if(Roles.userIsInRole(Meteor.user(), "organization")) {
                BlazeLayout.render("fullWidthLayout", {
                    nav: "organizationNav",
                    content: "contact",
                    attr: {
                        title: "Contact Us"
                    }
                });
            } else {
                BlazeLayout.render("layout", {
                    content: "contact",
                    attr: {
                        title: "Contact Us"
                    }
                });
            }
        },
        name: "contact"
    });

    FlowRouter.notFound = {
        action() {
            BlazeLayout.render("publicLayout", {
                content: "404"
            });
        }
    };
};