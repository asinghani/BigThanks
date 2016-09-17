import createAccountsRoutes from "../universal/routes/accounts.js";
import createUserRoutes from "../universal/routes/user.js";
import createOrganizationRoutes from "../universal/routes/organization.js";
import createPublicRoutes from "../universal/routes/public.js";
import createAdminRoutes from "../universal/routes/admin.js";

import setupAccounts from "../universal/config/accounts.js";

FlowRouter.wait();

Tracker.autorun(() => {
    if (Roles.subscription.ready() && !FlowRouter._initialized) {
        return FlowRouter.initialize();
    }
});


AccountsTemplates._initialized = false;

setupAccounts();

// Main routes
createAccountsRoutes();
createUserRoutes();
createOrganizationRoutes();
createPublicRoutes();
createAdminRoutes();

AccountsTemplates._init();

// Extra debug code
import setupDebug from "../universal/debug.js";
if(Meteor.isDevelopment){
    setupDebug();
}