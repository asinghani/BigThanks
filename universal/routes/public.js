import { getNav, getLayout } from "../util/layout.js";

export default () => {
    var publicRoutes = FlowRouter.group({});
    publicRoutes.route("/", {
        action() {
            BlazeLayout.render(getLayout(), {
                content: "home",
                nav: getNav()
            });
        },
        name: "home"
    });
    
    publicRoutes.route("/help", {
        action() {
            BlazeLayout.render(getLayout(), {
                content: "help",
                nav: getNav(),
                attr: {
                    title: "cow",
                    subtitle: "fig banana"
                }
            });
        },
        name: "help"
    });

    publicRoutes.route("/contact", {
        action() {
            BlazeLayout.render(getLayout(), {
                content: "contact",
                nav: getNav()
            });
        },
        name: "contact"
    });

    publicRoutes.route("/volunteer-opportunities", {
        action() {
            BlazeLayout.render(getLayout(), {
                content: "volunteerOpportunities",
                nav: getNav()
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