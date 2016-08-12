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

    AccountsTemplates.configureRoute("changePwd");
    AccountsTemplates.configureRoute("forgotPwd");
    AccountsTemplates.configureRoute("resetPwd");
    AccountsTemplates.configureRoute("signIn");
    AccountsTemplates.configureRoute("signUp");
    AccountsTemplates.configureRoute("verifyEmail");
};