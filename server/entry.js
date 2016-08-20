import setupAccounts from "../universal/config/accounts.js";
import setupBrowserPolicy from "./config/security.js";
import { Organizations } from "../imports/api/organizations.js";

console.dir(Organizations.find({}).fetch());

setupBrowserPolicy(BrowserPolicy);
setupAccounts();

// Extra debug code
import setupDebug from "../universal/debug.js";
if(Meteor.isDevelopment){
    setupDebug();
}