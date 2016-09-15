import setupAccounts from "../universal/accounts.js";
import createRoutes from "../universal/routes.js";

setupAccounts();

createRoutes();

Meteor.startup(() => {
    $("body").addClass("skin-blue");
});