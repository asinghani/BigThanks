import createAccountsRoutes from "../universal/routes/accounts.js";
import createMainRoutes from "../universal/routes/main.js";
import createOrganizationRoutes from "../universal/routes/organization.js";
import createPublicRoutes from "../universal/routes/public.js";
import createOtherRoutes from "../universal/routes/other.js";
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

// Most routes
createAccountsRoutes();
createMainRoutes();
createOrganizationRoutes();
createPublicRoutes();

// Always last to prevent conflicts
createOtherRoutes();

AccountsTemplates._init(); // Hack to prevent "Routes before init" error