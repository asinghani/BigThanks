export default () => {

    /**
     * Redirect user to page previously attempting to access after logging in (stored in "redirectAfterLogin" session variable)
     */
    Accounts.onLogin(() => {
        var redirect;
        redirect = Session.get("redirectAfterLogin");
        if (redirect != null) {
            if (redirect !== "/login") {
                return Router.go(redirect);
            }
        }
    });

    // All routes accessed not logged in
    AccountsTemplates.configureRoute("forgotPwd");
    AccountsTemplates.configureRoute("resetPwd");
    AccountsTemplates.configureRoute("signIn");
    AccountsTemplates.configureRoute("signUp");
    AccountsTemplates.configureRoute("verifyEmail");

    // Change password route
    AccountsTemplates.configureRoute("changePwd", {
        path: "/user/change-password"
    });

    // Allow /sign-out route for links
    FlowRouter.route("/sign-out", {
        action() {
            AccountsTemplates.logout();
            BlazeLayout.render("layout", {
                content: "home",
                nav: "publicNav",
                extra: "logged-out"
            });
        },
        name: "logout"
    });

};