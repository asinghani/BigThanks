import { Organizations } from "/imports/api/organizations.js";

Meteor.startup(() => {
    process.env.MAIL_URL = Meteor.settings.private.email.mail_url;

    SSR.compileTemplate("enroll", Assets.getText("templates/email/enroll.html"));
    SSR.compileTemplate("reset", Assets.getText("templates/email/reset.html"));
    SSR.compileTemplate("verify", Assets.getText("templates/email/verify.html"));
    SSR.compileTemplate("voucher", Assets.getText("templates/email/voucher.html"));

    Accounts.emailTemplates.from = Meteor.settings.private.email.no_reply;

    Accounts.emailTemplates.resetPassword.subject = () => { return "Reset password on Big Thanks"; };
    Accounts.emailTemplates.resetPassword.html = (user, url) => {
        return SSR.render("reset", {url: url});
    };

    Accounts.emailTemplates.verifyEmail.subject = () => { return "Verify Email on Big Thanks"; };
    Accounts.emailTemplates.verifyEmail.html = (user, url) => {
        return SSR.render("verify", {url: url, user: user.profile.name});
    };

    Accounts.emailTemplates.enrollAccount.subject = () => { return "Invitation to join your organization on Big Thanks"; };
    Accounts.emailTemplates.enrollAccount.html = (user, url) => {
        var o = "l";
        try {
            o = Organizations.find({_id: user.profile.organization}).fetch()[0];
        } catch (err) {
            console.error(err);
        }
        return SSR.render("enroll", {url: url, user: user.profile.name, organization: o});
    };
});