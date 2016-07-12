export default function () {
    Accounts.onLogin(function() {
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
}