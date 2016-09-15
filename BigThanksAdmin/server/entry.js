Meteor.startup(() => {
    process.env.MAIL_URL = Meteor.settings.private.email.mail_url;
});

import setupAccounts from "../universal/accounts.js";

setupAccounts();