import setupAccounts from "../universal/config/accounts.js";
import setupBrowserPolicy from "./config/security.js";
import { Organizations } from "../imports/api/organizations.js";
import { Items } from "/imports/api/items.js";

setupBrowserPolicy(BrowserPolicy);
setupAccounts();

// Extra debug code
import setupDebug from "../universal/debug.js";
if(Meteor.isDevelopment){
    setupDebug();
}

Kadira.connect(Meteor.settings.private.kadira.appId, Meteor.settings.private.kadira.appSecret);

//Picker.route('/', function(params, req, res, next) {
//    res.end("cow");
//});