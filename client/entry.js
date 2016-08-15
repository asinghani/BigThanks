import createAccountsRoutes from "../universal/routes/accounts.js";
import createUserRoutes from "../universal/routes/user.js";
import createOrganizationRoutes from "../universal/routes/organization.js";
import createPublicRoutes from "../universal/routes/public.js";
import setupAccounts from "../universal/config/accounts.js";

FlowRouter.wait();

Tracker.autorun(() => {
    if (Roles.subscription.ready() && !FlowRouter._initialized) {
        return FlowRouter.initialize();
    }
});


AccountsTemplates._initialized = false;

// Always first for configuration
setupAccounts();

// Main routes
createAccountsRoutes();
createUserRoutes();
createOrganizationRoutes();
createPublicRoutes();

AccountsTemplates._init(); // Hack to prevent "Routes before init" error

// Extra debug code
import setupDebug from "../universal/debug.js";
if(Meteor.isDevelopment){
    setupDebug();
}