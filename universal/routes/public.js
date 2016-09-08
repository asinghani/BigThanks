import { getNav, getLayout } from "../util/layout.js";

export default () => {
    var publicRoutes = FlowRouter.group({});
    publicRoutes.route("/", {
        action() {
            BlazeLayout.render("home");
        },
        name: "home"
    });
    
    publicRoutes.route("/help", {
        action() {
            BlazeLayout.render(getLayout(), {
                content: "help",
                nav: getNav(),
                attr: {
                    title: "Help",
                    subtitle: "---"
                }
            });
        },
        name: "help"
    });

    publicRoutes.route("/contact", {
        action() {
            BlazeLayout.render(getLayout(), {
                content: "contact",
                nav: getNav(),
                attr: {
                    title: "Contact Us"
                }
            });
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
            BlazeLayout.render(getLayout(), {
                content: "404",
                nav: getNav()
            });
        }
    };
};