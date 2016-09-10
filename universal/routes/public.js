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

    publicRoutes.route("/business", {
        action() {
            BlazeLayout.render("publicLayout", {
                content: "business",
                attr: {
                    title: "Business",
                    subtitle: "Find New Volunteers or Sponsor Purchasable Items"
                }
            });
        },
        name: "business"
    });

    publicRoutes.route("/contact", {
        action() {
            if(!Meteor.user()){
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

    publicRoutes.route("/volunteer-opportunities", {
        action() {
            BlazeLayout.render(getLayout(), {
                content: "volunteerOpportunities",
                nav: getNav(),
                attr: {
                    title: "Volunteer Opportunities",
                    subtitle: "Find and sign up for nearby volunteer opportunities."
                }
            });
        },
        name: "volunteerOpportunities"
    });

    FlowRouter.notFound = {
        action() {
            BlazeLayout.render("publicLayout", {
                content: "404"
            });
        }
    };
};