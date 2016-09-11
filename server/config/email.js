Meteor.startup(() => {
    process.env.MAIL_URL = Meteor.settings.private.email.mail_url;

    SSR.compileTemplate("testEmail", Assets.getText("templates/email/password-reset.html"));

    Accounts.emailTemplates.from = Meteor.settings.private.email.no_reply;

    Accounts.emailTemplates.resetPassword.subject = () => { return "Reset password on Big Thanks"; };
    Accounts.emailTemplates.resetPassword.html = (user, url) => {
        return SSR.render("testEmail", {url: url});
    };

});