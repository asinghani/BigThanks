// { "path" : "client/entry.js" }
import createMainRoutes from "../universal/routes/main.js";
import createPublicRoutes from "../universal/routes/public.js";
import createAccountsRoutes from "../universal/routes/accounts.js";
import createOrganizationRoutes from "../universal/routes/organization.js";

createMainRoutes();
createPublicRoutes();
createAccountsRoutes();
createOrganizationRoutes();