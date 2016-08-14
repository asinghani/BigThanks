import "../imports/api/organizations.js";
import "../imports/api/opportunities.js";

import setupAccounts from "../universal/config/accounts.js";
import setupBrowserPolicy from "./config/security.js";

setupBrowserPolicy(BrowserPolicy);
setupAccounts();