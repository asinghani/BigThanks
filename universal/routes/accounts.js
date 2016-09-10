import { getNav, getLayout } from "../util/layout.js";

export default () => {

    /**
     * Redirect user to page previously attempting to access after logging in (stored in "redirectAfterLogin" session variable)
     */
    Accounts.onLogin(() => {
        var redirect;
        redirect = Session.get("redirectAfterLogin");
        if (redirect != null) {
            if (redirect !== "/login") {
                return FlowRouter.go(redirect);
            }
        }
    });

    // All routes accessed not logged in
    AccountsTemplates.configureRoute("forgotPwd", {
        layoutRegions: {
            attr: {
                title: "Reset Password"
            }
        }
    });
    AccountsTemplates.configureRoute("resetPwd");
    AccountsTemplates.configureRoute("signIn", {
        layoutRegions: {
            attr: {
                title: "Sign In"
            }
        }
    });
    AccountsTemplates.configureRoute("signUp", {
        layoutRegions: {
            attr: {
                title: "Create an Account",
                subtitle: "Get started today!"
            }
        }
    });

    // Change password route
    AccountsTemplates.configureRoute("changePwd", {
        path: "/change-password",
        layoutTemplate: getLayout(),
        layoutRegions: {
            nav: getNav()
        }, attr: {
            title: "Change Password"
        }
    });

    // Allow /sign-out route for links
    FlowRouter.route("/sign-out", {
        action(ctx, redirect) {
            AccountsTemplates.logout();
            redirect("logged-out");
        },
        name: "logout"
    });

    FlowRouter.route("/logged-out", {
        action() {
            BlazeLayout.render("home", {
                extra: "loggedOutModal"
            });
        },
        name: "home2"
    });
};