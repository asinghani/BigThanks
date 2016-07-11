export default function () {
    FlowRouter.route("/", {
        action() {
            BlazeLayout.render("layout", {
                content: "home",
                nav: "nav"
            });
        },
        name: "home"
    });
    AccountsTemplates.configureRoute("changePwd");
    AccountsTemplates.configureRoute("forgotPwd");
    AccountsTemplates.configureRoute("resetPwd");
    AccountsTemplates.configureRoute("signIn");
    AccountsTemplates.configureRoute("signUp");
    AccountsTemplates.configureRoute("verifyEmail");
}