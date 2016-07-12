// { "path" : "client/entry.js" }
import createMainRoutes from "../universal/routes/mainRoutes.js";
import createPublicRoutes from "../universal/routes/publicRoutes.js";
import createAccountsRoutes from "../universal/routes/accountsRoutes.js";

createMainRoutes();
createPublicRoutes();
createAccountsRoutes();
