var require = meteorInstall({"imports":{"api":{"items.js":["meteor/mongo",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/items.js                                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({Items:function(){return Items}});var Mongo;module.import("meteor/mongo",{"Mongo":function(v){Mongo=v}});
                                                                                                                       //
var Items = new Mongo.Collection("items");                                                                             // 3
                                                                                                                       //
if (Meteor.isServer) {                                                                                                 // 5
                                                                                                                       //
    Meteor.methods({                                                                                                   // 7
        "purchase": function purchase(id) {                                                                            // 8
            if (!Meteor.userId()) {                                                                                    // 9
                throw new Meteor.Error("not-authorized");                                                              // 10
            }                                                                                                          // 11
                                                                                                                       //
            if (!id) {                                                                                                 // 13
                throw new Meteor.Error("invalid-args");                                                                // 14
            }                                                                                                          // 15
                                                                                                                       //
            var item = Items.find({ _id: new Mongo.ObjectID(id) }).fetch()[0];                                         // 17
            var code = item.codes[0];                                                                                  // 18
                                                                                                                       //
            if (!item || !code || item.stock === 0 || item.codes.length === 0) {                                       // 20
                throw new Meteor.Error("invalid-action");                                                              // 21
            }                                                                                                          // 22
                                                                                                                       //
            Items.update({ _id: new Mongo.ObjectID(id) }, { $pull: { codes: code }, $inc: { stock: -1 } });            // 24
                                                                                                                       //
            Meteor.users.update({ _id: Meteor.userId() }, { $inc: {                                                    // 26
                    "profile.credits": 0 - parseInt(item.cost)                                                         // 27
                } });                                                                                                  // 26
                                                                                                                       //
            var url = generateBarcode(code);                                                                           // 31
                                                                                                                       //
            var emailMsg = "\n                Below is your e-voucher for the " + item.name + " that you purchased on Big Thanks\n                <hr>\n                <span style=\"font-weight:bold;\">Credits Spent: </span>\n                " + item.cost + "\n                <br>\n                <br>\n                <span style=\"font-weight:bold;\">Code: </span>\n                " + code + "\n                <br>\n                <img src=\"" + url + "\">\n                <br>\n                <br>\n                This item was sponsored by <a href=\"" + item.website + "\">" + item.sponsor + "</a>\n                <br>\n                <br>\n                Please do not reply to this email\n            ";
                                                                                                                       //
            Email.send({                                                                                               // 53
                from: Meteor.settings["private"].email.no_reply,                                                       // 54
                to: Meteor.user().emails[0].address,                                                                   // 55
                subject: "Big Thanks: Your " + item.name,                                                              // 56
                html: emailMsg                                                                                         // 57
            });                                                                                                        // 53
        }                                                                                                              // 59
    });                                                                                                                // 7
                                                                                                                       //
    var AWS = Npm.require("aws-sdk");                                                                                  // 62
    var barcodeGenerate = Npm.require("barcode");                                                                      // 63
    AWS.config.region = "us-west-2";                                                                                   // 64
                                                                                                                       //
    var generateBarcode = function generateBarcode(code) {                                                             // 66
        var barcode = barcodeGenerate("code39", {                                                                      // 67
            data: code + "",                                                                                           // 68
            width: 350,                                                                                                // 69
            height: 100                                                                                                // 70
        });                                                                                                            // 67
        var getStream = Meteor.wrapAsync(barcode.getStream, barcode);                                                  // 72
        var body = getStream();                                                                                        // 73
        var s3 = new AWS.S3({ params: { Bucket: "bigthanksassets", Key: code + ".png" } });                            // 74
        var upload = Meteor.wrapAsync(s3.upload, s3);                                                                  // 75
        try {                                                                                                          // 76
            return upload({ Body: body, ACL: "public-read" }).Location;                                                // 77
        } catch (e) {                                                                                                  // 78
            return "";                                                                                                 // 79
        }                                                                                                              // 80
    };                                                                                                                 // 81
                                                                                                                       //
    Meteor.publish("items", function () {                                                                              // 83
        if (this.userId) {                                                                                             // 84
            return Items.find({}, { instructions: 0, codes: 0 });                                                      // 85
        }                                                                                                              // 86
    });                                                                                                                // 87
}                                                                                                                      // 88
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"organizations.js":["meteor/mongo",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/api/organizations.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({Organizations:function(){return Organizations}});var Mongo;module.import("meteor/mongo",{"Mongo":function(v){Mongo=v}});
                                                                                                                       //
var Organizations = new Mongo.Collection("organizations");                                                             // 3
                                                                                                                       //
if (Meteor.isServer) {                                                                                                 // 5
    Meteor.methods({                                                                                                   // 6
        /**                                                                                                            //
         * Delete volunteer opportunity                                                                                //
         *                                                                                                             //
         * Required permission: Organization Opportunities                                                             //
         */                                                                                                            //
                                                                                                                       //
        "opportunity.delete": function opportunityDelete(id) {                                                         // 12
            if (!id) {                                                                                                 // 13
                throw new Meteor.Error("invalid-args");                                                                // 14
            }                                                                                                          // 15
                                                                                                                       //
            if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), ["organization_admin", "organization_opportunities"])) {
                throw new Meteor.Error("not-authorized");                                                              // 18
            }                                                                                                          // 19
                                                                                                                       //
            Organizations.update({ _id: new Mongo.ObjectID(Meteor.user().profile.organization), "opportunities._id": id }, {
                $set: { "opportunities.$.deleted": true }                                                              // 22
            });                                                                                                        // 21
        },                                                                                                             // 24
        "opportunity.update": function opportunityUpdate(id, opportunity) {                                            // 24
            if (!id || !opportunity) {                                                                                 // 25
                throw new Meteor.Error("invalid-args");                                                                // 26
            }                                                                                                          // 27
                                                                                                                       //
            if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), ["organization_admin", "organization_opportunities"])) {
                throw new Meteor.Error("not-authorized");                                                              // 30
            }                                                                                                          // 31
                                                                                                                       //
            Organizations.update({ _id: new Mongo.ObjectID(Meteor.user().profile.organization), "opportunities._id": id }, {
                $set: { "opportunities.$": opportunity }                                                               // 34
            });                                                                                                        // 33
        },                                                                                                             // 36
        "opportunity.insert": function opportunityInsert(opportunity) {                                                // 36
            if (!opportunity) {                                                                                        // 37
                throw new Meteor.Error("invalid-args");                                                                // 38
            }                                                                                                          // 39
                                                                                                                       //
            if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), ["organization_admin", "organization_opportunities"])) {
                throw new Meteor.Error("not-authorized");                                                              // 42
            }                                                                                                          // 43
                                                                                                                       //
            opportunity._id = new Mongo.ObjectID()._str;                                                               // 45
            Organizations.update({ _id: new Mongo.ObjectID(Meteor.user().profile.organization) }, {                    // 46
                $push: { "opportunities": opportunity }                                                                // 47
            });                                                                                                        // 46
        },                                                                                                             // 49
        "opportunity.register": function opportunityRegister(organization, opportunity) {                              // 49
            if (!organization || !opportunity) {                                                                       // 50
                throw new Meteor.Error("invalid-args");                                                                // 51
            }                                                                                                          // 52
                                                                                                                       //
            if (!Meteor.userId()) {                                                                                    // 54
                throw new Meteor.Error("not-authorized");                                                              // 55
            }                                                                                                          // 56
                                                                                                                       //
            var email = Meteor.user().emails[0].address;                                                               // 58
                                                                                                                       //
            if (Organizations.find({ _id: new Mongo.ObjectID(organization), "opportunities._id": opportunity,          // 60
                "opportunities.registrations.email": email }).fetch().length > 0) {                                    // 61
                return;                                                                                                // 62
            }                                                                                                          // 63
                                                                                                                       //
            Organizations.update({ _id: new Mongo.ObjectID(organization), "opportunities._id": opportunity }, {        // 65
                $push: { "opportunities.$.registrations": {                                                            // 66
                        _id: new Mongo.ObjectID()._str,                                                                // 67
                        name: Meteor.user().profile.name,                                                              // 68
                        email: email,                                                                                  // 69
                        timestamp: moment().unix()                                                                     // 70
                    } }                                                                                                // 66
            });                                                                                                        // 65
        }                                                                                                              // 73
    });                                                                                                                // 6
}                                                                                                                      // 75
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}},"server":{"config":{"email.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/config/email.js                                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.startup(function () {                                                                                           // 1
    process.env.MAIL_URL = Meteor.settings["private"].email.mail_url;                                                  // 2
                                                                                                                       //
    SSR.compileTemplate("testEmail", Assets.getText("templates/email/password-reset.html"));                           // 4
                                                                                                                       //
    Accounts.emailTemplates.from = Meteor.settings["private"].email.no_reply;                                          // 6
                                                                                                                       //
    Accounts.emailTemplates.resetPassword.subject = function () {                                                      // 8
        return "Reset password on Big Thanks";                                                                         // 8
    };                                                                                                                 // 8
    Accounts.emailTemplates.resetPassword.html = function (user, url) {                                                // 9
        return SSR.render("testEmail", { url: url });                                                                  // 10
    };                                                                                                                 // 11
});                                                                                                                    // 13
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"reCaptcha.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/config/reCaptcha.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
AccountsTemplates.configure({                                                                                          // 1
    reCaptcha: {                                                                                                       // 2
        secretKey: Meteor.settings["private"].reCaptcha.secretKey                                                      // 3
    }                                                                                                                  // 2
});                                                                                                                    // 1
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"security.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/config/security.js                                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export("default",exports.default=(function (BrowserPolicy) {                                                    // 1
    BrowserPolicy.content.allowOriginForAll("*.googleapis.com");                                                       // 2
    BrowserPolicy.content.allowOriginForAll("*.gstatic.com");                                                          // 3
    BrowserPolicy.content.allowOriginForAll("*.bootstrapcdn.com");                                                     // 4
    BrowserPolicy.content.allowOriginForAll("*.google.com");                                                           // 5
    BrowserPolicy.content.allowOriginForAll("cdn.jsdelivr.net");                                                       // 6
    BrowserPolicy.content.allowFontDataUrl();                                                                          // 7
                                                                                                                       //
    BrowserPolicy.content.disallowInlineScripts();                                                                     // 9
    BrowserPolicy.content.disallowConnect();                                                                           // 10
                                                                                                                       //
    var root = __meteor_runtime_config__.ROOT_URL;                                                                     // 12
    BrowserPolicy.content.allowConnectOrigin(root);                                                                    // 13
    BrowserPolicy.content.allowConnectOrigin(root.replace("http", "https"));                                           // 14
    BrowserPolicy.content.allowConnectOrigin(root.replace(/http(s?)/, "ws$1"));                                        // 15
                                                                                                                       //
    BrowserPolicy.content.allowConnectOrigin("http://bigthanks.dev");                                                  // 17
    BrowserPolicy.content.allowConnectOrigin("https://bigthanks.dev");                                                 // 18
    BrowserPolicy.content.allowConnectOrigin("ws://bigthanks.dev");                                                    // 19
    BrowserPolicy.content.allowConnectOrigin("wss://bigthanks.dev");                                                   // 20
    BrowserPolicy.content.allowConnectOrigin("https://enginex.kadira.io");                                             // 21
                                                                                                                       //
    BrowserPolicy.content.allowImageOrigin("*"); // Allow organization logos                                           // 23
}));                                                                                                                   // 24
                                                                                                                       //
Meteor.startup(function () {                                                                                           // 26
    Meteor.users.deny({                                                                                                // 27
        update: function update() {                                                                                    // 28
            return true;                                                                                               // 29
        }                                                                                                              // 30
    });                                                                                                                // 27
                                                                                                                       //
    if (Meteor.isDevelopment) {                                                                                        // 33
        SSL("./assets/app/bigthanks.dev.key", "./assets/app/bigthanks.dev.crt", 443);                                  // 34
    }                                                                                                                  // 35
});                                                                                                                    // 36
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"methods":{"organization.js":["/imports/api/organizations.js",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/methods/organization.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var Organizations;module.import("/imports/api/organizations.js",{"Organizations":function(v){Organizations=v}});       // 1
                                                                                                                       //
Meteor.methods({                                                                                                       // 3
    /**                                                                                                                //
     * Update organization settings                                                                                    //
     *                                                                                                                 //
     * Required Permission: Organization Admin                                                                         //
     */                                                                                                                //
                                                                                                                       //
    "organization.update": function organizationUpdate(name, website, logo) {                                          // 9
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {                          // 10
            throw new Meteor.Error("not-authorized");                                                                  // 11
        }                                                                                                              // 12
        Organizations.update({ _id: new Mongo.ObjectID(Meteor.user().profile.organization) }, { $set: { name: name, website: website, logo: logo } });
    },                                                                                                                 // 14
                                                                                                                       //
                                                                                                                       //
    /**                                                                                                                //
     * Reset password of user in organization                                                                          //
     *                                                                                                                 //
     * Required Permission: Organization Admin                                                                         //
     */                                                                                                                //
    "organization.user.resetPassword": function organizationUserResetPassword(id) {                                    // 21
        if (!id) {                                                                                                     // 22
            throw new Meteor.Error("invalid-args");                                                                    // 23
        }                                                                                                              // 24
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {                          // 25
            throw new Meteor.Error("not-authorized");                                                                  // 26
        }                                                                                                              // 27
        Accounts.sendResetPasswordEmail(id);                                                                           // 28
    },                                                                                                                 // 29
                                                                                                                       //
                                                                                                                       //
    /**                                                                                                                //
     * Get user object for specific user in organization                                                               //
     *                                                                                                                 //
     * Required Permission: Organization Admin                                                                         //
     */                                                                                                                //
    "organization.user.get": function organizationUserGet(id, render) {                                                // 36
        if (!id) {                                                                                                     // 37
            throw new Meteor.Error("invalid-args");                                                                    // 38
        }                                                                                                              // 39
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {                          // 40
            throw new Meteor.Error("not-authorized");                                                                  // 41
        }                                                                                                              // 42
                                                                                                                       //
        var user = Meteor.users.find({ _id: id }).fetch()[0];                                                          // 44
        if (!user || !user.profile) {                                                                                  // 45
            throw new Meteor.Error("invalid-args");                                                                    // 46
        }                                                                                                              // 47
        if (user.profile.organization !== Meteor.user().profile.organization) {                                        // 48
            throw new Meteor.Error("not-authorized");                                                                  // 49
        }                                                                                                              // 50
                                                                                                                       //
        return user;                                                                                                   // 52
    },                                                                                                                 // 53
                                                                                                                       //
                                                                                                                       //
    /**                                                                                                                //
     * Delete a user                                                                                                   //
     *                                                                                                                 //
     * Required Permission: Organization Admin                                                                         //
     */                                                                                                                //
    "organization.user.delete": function organizationUserDelete(id) {                                                  // 60
        if (!id) {                                                                                                     // 61
            throw new Meteor.Error("invalid-args");                                                                    // 62
        }                                                                                                              // 63
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {                          // 64
            throw new Meteor.Error("not-authorized");                                                                  // 65
        }                                                                                                              // 66
                                                                                                                       //
        var user = Meteor.users.find({ _id: id }).fetch()[0];                                                          // 68
        if (!user || !user.profile) {                                                                                  // 69
            throw new Meteor.Error("invalid-args");                                                                    // 70
        }                                                                                                              // 71
        if (user.profile.organization !== Meteor.user().profile.organization) {                                        // 72
            throw new Meteor.Error("not-authorized");                                                                  // 73
        }                                                                                                              // 74
                                                                                                                       //
        Meteor.users.remove({ _id: id });                                                                              // 76
                                                                                                                       //
        return true;                                                                                                   // 78
    },                                                                                                                 // 79
                                                                                                                       //
                                                                                                                       //
    /**                                                                                                                //
     * Change permissions of a user                                                                                    //
     *                                                                                                                 //
     * Required Permission: Organization Admin                                                                         //
     */                                                                                                                //
    "organization.user.permission.set": function organizationUserPermissionSet(id, permission) {                       // 86
        if (!id || !permission) {                                                                                      // 87
            throw new Meteor.Error("invalid-args");                                                                    // 88
        }                                                                                                              // 89
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {                          // 90
            throw new Meteor.Error("not-authorized");                                                                  // 91
        }                                                                                                              // 92
                                                                                                                       //
        var user = Meteor.users.find({ _id: id }).fetch()[0];                                                          // 94
        if (!user || !user.profile) {                                                                                  // 95
            throw new Meteor.Error("invalid-args");                                                                    // 96
        }                                                                                                              // 97
        if (user.profile.organization !== Meteor.user().profile.organization) {                                        // 98
            throw new Meteor.Error("not-authorized");                                                                  // 99
        }                                                                                                              // 100
                                                                                                                       //
        Roles.removeUsersFromRoles(id, ["organization_opportunities", "organization_admin", "organization_validate"]);
        switch (permission) {                                                                                          // 103
                                                                                                                       //
            case "admin":                                                                                              // 105
                Roles.addUsersToRoles(id, "organization_admin");                                                       // 106
                break;                                                                                                 // 107
            case "opportunities":                                                                                      // 108
                Roles.addUsersToRoles(id, "organization_opportunities");                                               // 109
                break;                                                                                                 // 110
            case "validate":                                                                                           // 111
                Roles.addUsersToRoles(id, "organization_validate");                                                    // 112
                break;                                                                                                 // 113
            case "opportunities_validate":                                                                             // 114
                Roles.addUsersToRoles(id, "organization_opportunities");                                               // 115
                Roles.addUsersToRoles(id, "organization_validate");                                                    // 116
                break;                                                                                                 // 117
                                                                                                                       //
        }                                                                                                              // 103
        return true;                                                                                                   // 120
    },                                                                                                                 // 121
                                                                                                                       //
                                                                                                                       //
    /**                                                                                                                //
     * Add a user to organization                                                                                      //
     *                                                                                                                 //
     * Required Permission: Organization Admin                                                                         //
     */                                                                                                                //
    "organization.user.add": function organizationUserAdd(email, name) {                                               // 128
                                                                                                                       //
        if (!email) {                                                                                                  // 130
            throw new Meteor.Error("invalid-args");                                                                    // 131
        }                                                                                                              // 132
                                                                                                                       //
        if (!name || name.length == 0) {                                                                               // 134
            name = email.split("@")[0];                                                                                // 135
        }                                                                                                              // 136
                                                                                                                       //
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {                          // 138
            throw new Meteor.Error("not-authorized");                                                                  // 139
        }                                                                                                              // 140
                                                                                                                       //
        Accounts.createUser({                                                                                          // 142
            email: email,                                                                                              // 143
            profile: {                                                                                                 // 144
                name: name,                                                                                            // 145
                organization: Meteor.user().profile.organization,                                                      // 146
                firstLogin: true                                                                                       // 147
            }                                                                                                          // 144
        });                                                                                                            // 142
                                                                                                                       //
        var id = Accounts.findUserByEmail(email)._id;                                                                  // 151
                                                                                                                       //
        if (!id) {                                                                                                     // 153
            throw new Meteor.Error("invalid-args");                                                                    // 154
        }                                                                                                              // 155
                                                                                                                       //
        Accounts.sendEnrollmentEmail(id);                                                                              // 157
                                                                                                                       //
        var user = Meteor.users.find({ _id: id }).fetch()[0];                                                          // 159
        if (!user || !user.profile) {                                                                                  // 160
            throw new Meteor.Error("invalid-args");                                                                    // 161
        }                                                                                                              // 162
                                                                                                                       //
        Organizations.update({ _id: new Mongo.ObjectID(Meteor.user().profile.organization) }, { $push: {               // 164
                users: id                                                                                              // 165
            } });                                                                                                      // 164
                                                                                                                       //
        Roles.addUsersToRoles(id, "organization");                                                                     // 168
        Roles.addUsersToRoles(id, "organization_opportunities");                                                       // 169
        Roles.addUsersToRoles(id, "organization_validate");                                                            // 170
    },                                                                                                                 // 171
                                                                                                                       //
                                                                                                                       //
    /**                                                                                                                //
     * Confirm/Deny credit request                                                                                     //
     *                                                                                                                 //
     * Required Permission: Organization Validate                                                                      //
     */                                                                                                                //
    "organization.request.confirm": function organizationRequestConfirm(userId, organizationId, reqId, status, comment, length) {
                                                                                                                       //
        if (!userId || !organizationId || !reqId || !status || !length) {                                              // 180
            throw new Meteor.Error("invalid-args");                                                                    // 181
        }                                                                                                              // 182
                                                                                                                       //
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), ["organization_admin", "organization_validate"])) {
            throw new Meteor.Error("not-authorized");                                                                  // 185
        }                                                                                                              // 186
                                                                                                                       //
        if (organizationId !== Meteor.user().profile.organization) {                                                   // 188
            throw new Meteor.Error("not-authorized");                                                                  // 189
        }                                                                                                              // 190
                                                                                                                       //
        var user = Meteor.users.find({ _id: userId }).fetch()[0];                                                      // 192
        if (!user || !user.profile) {                                                                                  // 193
            throw new Meteor.Error("invalid-args");                                                                    // 194
        }                                                                                                              // 195
                                                                                                                       //
        var oldCredits = parseInt(Meteor.users.find({ _id: userId }).fetch()[0].profile.credits);                      // 197
        var totalTime = parseInt(Meteor.users.find({ _id: userId }).fetch()[0].profile.totalHours);                    // 198
                                                                                                                       //
        length = parseInt(length);                                                                                     // 200
        if (status == 2) length = 0;                                                                                   // 201
                                                                                                                       //
        Meteor.users.update({ _id: userId, "profile.history._id": reqId }, { $set: {                                   // 203
                "profile.history.$.status": status,                                                                    // 204
                "profile.history.$.comment": comment,                                                                  // 205
                "profile.history.$.new": true                                                                          // 206
            }, $inc: {                                                                                                 // 203
                "profile.credits": length,                                                                             // 208
                "profile.totalHours": Math.ceil(length / 60)                                                           // 209
            } });                                                                                                      // 207
                                                                                                                       //
        Organizations.update({ _id: new Mongo.ObjectID(organizationId) }, { $pull: {                                   // 212
                requests: {                                                                                            // 213
                    _id: reqId                                                                                         // 214
                }                                                                                                      // 213
            } });                                                                                                      // 212
    }                                                                                                                  // 217
});                                                                                                                    // 3
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"user.js":["/imports/api/organizations.js","meteor/email",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/methods/user.js                                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var Organizations;module.import("/imports/api/organizations.js",{"Organizations":function(v){Organizations=v}});var Email;module.import("meteor/email",{"Email":function(v){Email=v}});
                                                                                                                       // 2
                                                                                                                       //
Meteor.methods({                                                                                                       // 4
                                                                                                                       //
    /**                                                                                                                //
     * Mark a history item / validation as already viewed                                                              //
     */                                                                                                                //
                                                                                                                       //
    "user.history.resetNew": function userHistoryResetNew(id) {                                                        // 9
        if (!Meteor.userId()) {                                                                                        // 10
            throw new Meteor.Error("not-authorized");                                                                  // 11
        }                                                                                                              // 12
        Meteor.users.update({ _id: Meteor.userId(), "profile.history._id": id }, { $set: { "profile.history.$.new": false } });
    },                                                                                                                 // 14
                                                                                                                       //
                                                                                                                       //
    /**                                                                                                                //
     * Send a credit validation request                                                                                //
     */                                                                                                                //
    "request.send": function requestSend(opportunityName, time, organizationId) {                                      // 19
        if (!Meteor.userId()) {                                                                                        // 20
            throw new Meteor.Error("not-authorized");                                                                  // 21
        }                                                                                                              // 22
                                                                                                                       //
        var id = new Mongo.ObjectID()._str;                                                                            // 24
        var timestamp = moment().unix();                                                                               // 25
        Meteor.users.update({ _id: Meteor.userId() }, { $push: {                                                       // 26
                "profile.history": {                                                                                   // 27
                    _id: id,                                                                                           // 28
                    timestamp: timestamp,                                                                              // 29
                    opportunity: opportunityName,                                                                      // 30
                    length: time,                                                                                      // 31
                    credits: time,                                                                                     // 32
                    validator: organizationId,                                                                         // 33
                    status: 0,                                                                                         // 34
                    "new": false,                                                                                      // 35
                    comment: ""                                                                                        // 36
                }                                                                                                      // 27
            } });                                                                                                      // 26
        Organizations.update({ _id: new Mongo.ObjectID(organizationId) }, { $push: {                                   // 39
                requests: {                                                                                            // 40
                    _id: id,                                                                                           // 41
                    userId: Meteor.userId(),                                                                           // 42
                    reqId: id,                                                                                         // 43
                    name: opportunityName,                                                                             // 44
                    time: time,                                                                                        // 45
                    timestamp: timestamp,                                                                              // 46
                    userName: Meteor.user().profile.name                                                               // 47
                }                                                                                                      // 40
            } });                                                                                                      // 39
    },                                                                                                                 // 50
                                                                                                                       //
                                                                                                                       //
    /**                                                                                                                //
     * Update user's name                                                                                              //
     */                                                                                                                //
    "user.updateName": function userUpdateName(name) {                                                                 // 55
        if (!Meteor.userId()) {                                                                                        // 56
            throw new Meteor.Error("not-authorized");                                                                  // 57
        }                                                                                                              // 58
                                                                                                                       //
        if (!name) {                                                                                                   // 60
            throw new Meteor.Error("invalid-args");                                                                    // 61
        }                                                                                                              // 62
                                                                                                                       //
        Meteor.users.update({ _id: Meteor.userId() }, { $set: { "profile.name": name } });                             // 64
    },                                                                                                                 // 65
                                                                                                                       //
                                                                                                                       //
    /**                                                                                                                //
     * Send reset password email                                                                                       //
     */                                                                                                                //
    "user.resetPassword": function userResetPassword() {                                                               // 70
        if (!Meteor.userId()) {                                                                                        // 71
            throw new Meteor.Error("not-authorized");                                                                  // 72
        }                                                                                                              // 73
                                                                                                                       //
        Accounts.sendResetPasswordEmail(Meteor.userId());                                                              // 75
    },                                                                                                                 // 76
                                                                                                                       //
                                                                                                                       //
    /**                                                                                                                //
     * Contact form submitted                                                                                          //
     */                                                                                                                //
    "contact.submit": function contactSubmit(name, email, subject, message) {                                          // 81
        var confirmation = "\n            Big Thanks contact form has been submitted. You will receive a reply in 1-2 business days.\n            <h3>Submitted Information:</h3>\n            <hr>\n            <span style=\"font-weight:bold;\">Name</span>\n            <br>\n            " + name + "\n            <br>\n            <br>\n            <span style=\"font-weight:bold;\">Email</span>\n            <br>\n            " + email + "\n            <br>\n            <br>\n            <span style=\"font-weight:bold;\">Subject</span>\n            <br>\n            " + subject + "\n            <br>\n            <br>\n            <span style=\"font-weight:bold;\">Message</span>\n            <br>\n            " + message + "\n            <br>\n            <br>\n            Please do not reply to this email.\n        ";
                                                                                                                       //
        var emailMsg = "\n            Big Thanks contact form was submitted.\n            <h3>Submitted Information:</h3>\n            <hr>\n            <span style=\"font-weight:bold;\">Name</span>\n            <br>\n            " + name + "\n            <br>\n            <br>\n            <span style=\"font-weight:bold;\">Email</span>\n            <br>\n            " + email + "\n            <br>\n            <br>\n            <span style=\"font-weight:bold;\">Subject</span>\n            <br>\n            " + subject + "\n            <br>\n            <br>\n            <span style=\"font-weight:bold;\">Message</span>\n            <br>\n            " + message + "\n            <br>\n        ";
                                                                                                                       //
        Email.send({                                                                                                   // 134
            from: Meteor.settings["private"].email.no_reply,                                                           // 135
            to: email,                                                                                                 // 136
            replyTo: Meteor.settings["private"].email.contact,                                                         // 137
            subject: "Contact form submitted",                                                                         // 138
            html: confirmation                                                                                         // 139
        });                                                                                                            // 134
                                                                                                                       //
        Email.send({                                                                                                   // 142
            from: name + " <" + email + ">",                                                                           // 143
            to: Meteor.settings["private"].email.contact,                                                              // 144
            replyTo: email,                                                                                            // 145
            subject: "Contact Form: " + subject,                                                                       // 146
            html: emailMsg                                                                                             // 147
        });                                                                                                            // 142
    },                                                                                                                 // 150
                                                                                                                       //
                                                                                                                       //
    /**                                                                                                                //
     * Initial Tour Ended, reset firstLogin flag                                                                       //
     *                                                                                                                 //
     */                                                                                                                //
    "user.tour.ended": function userTourEnded() {                                                                      // 156
        if (!Meteor.userId()) {                                                                                        // 157
            throw new Meteor.Error("not-authorized");                                                                  // 158
        }                                                                                                              // 159
        Meteor.users.update({ _id: Meteor.userId() }, { $set: { "profile.firstLogin": false } });                      // 160
    },                                                                                                                 // 161
                                                                                                                       //
                                                                                                                       //
    /**                                                                                                                //
     * Restart the tour for user                                                                                       //
     */                                                                                                                //
    "user.tour.restart": function userTourRestart() {                                                                  // 166
        if (!Meteor.userId()) {                                                                                        // 167
            throw new Meteor.Error("not-authorized");                                                                  // 168
        }                                                                                                              // 169
        Meteor.users.update({ _id: Meteor.userId() }, { $set: { "profile.firstLogin": true } });                       // 170
    }                                                                                                                  // 171
});                                                                                                                    // 4
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]},"entry.js":["../universal/config/accounts.js","./config/security.js","../imports/api/organizations.js","/imports/api/items.js","../universal/debug.js",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/entry.js                                                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var setupAccounts;module.import("../universal/config/accounts.js",{"default":function(v){setupAccounts=v}});var setupBrowserPolicy;module.import("./config/security.js",{"default":function(v){setupBrowserPolicy=v}});var Organizations;module.import("../imports/api/organizations.js",{"Organizations":function(v){Organizations=v}});var Items;module.import("/imports/api/items.js",{"Items":function(v){Items=v}});var setupDebug;module.import("../universal/debug.js",{"default":function(v){setupDebug=v}});
                                                                                                                       // 2
                                                                                                                       // 3
                                                                                                                       // 4
                                                                                                                       //
setupBrowserPolicy(BrowserPolicy);                                                                                     // 6
setupAccounts();                                                                                                       // 7
                                                                                                                       //
// Extra debug code                                                                                                    //
                                                                                                                       // 10
if (Meteor.isDevelopment) {                                                                                            // 11
    setupDebug();                                                                                                      // 12
}                                                                                                                      // 13
                                                                                                                       //
Kadira.connect(Meteor.settings["private"].kadira.appId, Meteor.settings["private"].kadira.appSecret);                  // 15
                                                                                                                       //
//Picker.route('/', function(params, req, res, next) {                                                                 //
//    res.end("cow");                                                                                                  //
//});                                                                                                                  //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]},"universal":{"config":{"accounts.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// universal/config/accounts.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export("default",exports.default=(function () {                                                                 // 1
    AccountsTemplates.configure({                                                                                      // 2
        defaultLayout: "publicLayout",                                                                                 // 3
        defaultContentRegion: "content",                                                                               // 4
        confirmPassword: true,                                                                                         // 5
        enablePasswordChange: true,                                                                                    // 6
        enforceEmailVerification: false,                                                                               // 7
        forbidClientAccountCreation: false,                                                                            // 8
        overrideLoginErrors: true,                                                                                     // 9
        sendVerificationEmail: true,                                                                                   // 10
        lowercaseUsername: true,                                                                                       // 11
        focusFirstInput: true,                                                                                         // 12
                                                                                                                       //
        showAddRemoveServices: true,                                                                                   // 14
        showForgotPasswordLink: true,                                                                                  // 15
        showLabels: true,                                                                                              // 16
        showPlaceholders: true,                                                                                        // 17
        showResendVerificationEmailLink: true,                                                                         // 18
                                                                                                                       //
        continuousValidation: true,                                                                                    // 20
        negativeFeedback: true,                                                                                        // 21
        negativeValidation: true,                                                                                      // 22
        positiveValidation: true,                                                                                      // 23
        positiveFeedback: true,                                                                                        // 24
        showValidating: true,                                                                                          // 25
                                                                                                                       //
        homeRoutePath: "/user/dashboard",                                                                              // 27
        redirectTimeout: 4000,                                                                                         // 28
                                                                                                                       //
        onLogoutHook: function onLogoutHook() {                                                                        // 30
            FlowRouter.go("/");                                                                                        // 30
        },                                                                                                             // 30
        onSubmitHook: function onSubmitHook(err, state) {                                                              // 31
            if (!err) {                                                                                                // 32
                if (state === "changePwd") {                                                                           // 33
                    swal({                                                                                             // 34
                        title: "Changed Password",                                                                     // 35
                        text: "Your account password has been changed.",                                               // 36
                        type: "success"                                                                                // 37
                    }, function () {                                                                                   // 34
                        FlowRouter.go("/user/dashboard");                                                              // 39
                    });                                                                                                // 40
                    return false;                                                                                      // 41
                } else if (state === "resetPwd") {                                                                     // 42
                    FlowRouter.go("/user/dashboard");                                                                  // 43
                } else if (state === "signIn") {                                                                       // 44
                    FlowRouter.go("/user/dashboard");                                                                  // 45
                } else if (state === "signUp") {                                                                       // 46
                    FlowRouter.go("/user/dashboard");                                                                  // 47
                }                                                                                                      // 48
            }                                                                                                          // 49
        },                                                                                                             // 50
        postSignUpHook: function postSignUpHook(userId) {                                                              // 51
            // Running on server-side, see https://github.com/meteor-useraccounts/core/blob/master/Guide.md            //
            Meteor.users.update({ _id: userId }, { $set: { "profile.totalHours": 0, "profile.credits": 5, "profile.history": [{
                        "_id": new Mongo.ObjectID()._str,                                                              // 56
                        "timestamp": moment().unix(),                                                                  // 57
                        "opportunity": "Signup Bonus",                                                                 // 58
                        "length": -1,                                                                                  // 59
                        "credits": 5,                                                                                  // 60
                        "validator": undefined,                                                                        // 61
                        "status": 1,                                                                                   // 62
                        "new": false,                                                                                  // 63
                        "comment": ""                                                                                  // 64
                    }], "profile.firstLogin": true } });                                                               // 55
        },                                                                                                             // 68
                                                                                                                       //
        // Texts                                                                                                       //
        texts: {                                                                                                       // 71
            button: {                                                                                                  // 72
                signUp: "Register Now!"                                                                                // 73
            },                                                                                                         // 72
            title: {                                                                                                   // 75
                forgotPwd: "",                                                                                         // 76
                signIn: "",                                                                                            // 77
                signUp: "",                                                                                            // 78
                verifyEmail: "",                                                                                       // 79
                resetPwd: "",                                                                                          // 80
                changePwd: ""                                                                                          // 81
                                                                                                                       //
            },                                                                                                         // 75
            errors: {                                                                                                  // 84
                captchaVerification: "Captcha verification failed!",                                                   // 85
                loginForbidden: "Incorrect Email or Password",                                                         // 86
                mustBeLoggedIn: "Must be logged in to access this page"                                                // 87
            }                                                                                                          // 84
        },                                                                                                             // 71
        reCaptcha: {                                                                                                   // 90
            siteKey: Meteor.settings["public"].reCaptcha.siteKey,                                                      // 91
            theme: "light",                                                                                            // 92
            data_type: "image"                                                                                         // 93
        },                                                                                                             // 90
        showReCaptcha: true                                                                                            // 95
    });                                                                                                                // 2
                                                                                                                       //
    var email = AccountsTemplates.removeField("email");                                                                // 98
    var password = AccountsTemplates.removeField("password");                                                          // 99
                                                                                                                       //
    AccountsTemplates.addField({                                                                                       // 101
        _id: "name",                                                                                                   // 102
        type: "text",                                                                                                  // 103
        displayName: "Name",                                                                                           // 104
        required: true                                                                                                 // 105
    });                                                                                                                // 101
                                                                                                                       //
    AccountsTemplates.addField(email);                                                                                 // 108
    AccountsTemplates.addField({                                                                                       // 109
        _id: "password",                                                                                               // 110
        type: "password",                                                                                              // 111
        required: true,                                                                                                // 112
        minLength: 6,                                                                                                  // 113
        re: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,                                                                  // 114
        errStr: "At least 6 characters, one letter, and one number"                                                    // 115
    });                                                                                                                // 109
}));                                                                                                                   // 117
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"routes":{"accounts.js":["../util/layout.js",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// universal/routes/accounts.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var getNav,getLayout;module.import("../util/layout.js",{"getNav":function(v){getNav=v},"getLayout":function(v){getLayout=v}});
                                                                                                                       //
module.export("default",exports.default=(function () {                                                                 // 3
                                                                                                                       //
    /**                                                                                                                //
     * Redirect user to page previously attempting to access after logging in (stored in "redirectAfterLogin" session variable)
     */                                                                                                                //
    Accounts.onLogin(function () {                                                                                     // 8
        var redirect;                                                                                                  // 9
        redirect = Session.get("redirectAfterLogin");                                                                  // 10
        if (redirect != null) {                                                                                        // 11
            if (redirect !== "/login") {                                                                               // 12
                return FlowRouter.go(redirect);                                                                        // 13
            }                                                                                                          // 14
        }                                                                                                              // 15
    });                                                                                                                // 16
                                                                                                                       //
    // All routes accessed not logged in                                                                               //
    AccountsTemplates.configureRoute("forgotPwd", {                                                                    // 19
        layoutRegions: {                                                                                               // 20
            attr: {                                                                                                    // 21
                title: "Reset Password"                                                                                // 22
            }                                                                                                          // 21
        }                                                                                                              // 20
    });                                                                                                                // 19
    AccountsTemplates.configureRoute("resetPwd");                                                                      // 26
    AccountsTemplates.configureRoute("signIn", {                                                                       // 27
        layoutRegions: {                                                                                               // 28
            attr: {                                                                                                    // 29
                title: "Sign In"                                                                                       // 30
            }                                                                                                          // 29
        }                                                                                                              // 28
    });                                                                                                                // 27
    AccountsTemplates.configureRoute("signUp", {                                                                       // 34
        layoutRegions: {                                                                                               // 35
            attr: {                                                                                                    // 36
                title: "Create an Account",                                                                            // 37
                subtitle: "Get started today!"                                                                         // 38
            }                                                                                                          // 36
        }                                                                                                              // 35
    });                                                                                                                // 34
                                                                                                                       //
    // Change password route                                                                                           //
    AccountsTemplates.configureRoute("changePwd", {                                                                    // 44
        path: "/change-password",                                                                                      // 45
        layoutTemplate: getLayout(),                                                                                   // 46
        layoutRegions: {                                                                                               // 47
            nav: getNav(),                                                                                             // 48
            attr: {                                                                                                    // 49
                title: "Change Password"                                                                               // 50
            }                                                                                                          // 49
        }                                                                                                              // 47
    });                                                                                                                // 44
                                                                                                                       //
    // Allow /sign-out route for links                                                                                 //
    FlowRouter.route("/sign-out", {                                                                                    // 56
        action: function action() {                                                                                    // 57
            AccountsTemplates.logout();                                                                                // 58
            FlowRouter.redirect("/");                                                                                  // 59
        },                                                                                                             // 60
                                                                                                                       //
        name: "logout"                                                                                                 // 61
    });                                                                                                                // 56
}));                                                                                                                   // 63
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"organization.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// universal/routes/organization.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export("default",exports.default=(function () {                                                                 // 1
    var organizationRoutes = FlowRouter.group({                                                                        // 2
        prefix: "/organization",                                                                                       // 3
        triggersEnter: [function (ctx, redirect) {                                                                     // 4
            var route;                                                                                                 // 6
            if (!(Meteor.loggingIn() || Meteor.userId())) {                                                            // 7
                route = FlowRouter.current();                                                                          // 8
                if (route.route.name !== "login") {                                                                    // 9
                    Session.set("redirectAfterLogin", route.path);                                                     // 10
                }                                                                                                      // 11
                redirect("/sign-in");                                                                                  // 12
            } else if (!Roles.userIsInRole(Meteor.userId(), "organization")) {                                         // 13
                redirect("/user/dashboard");                                                                           // 14
            } else {                                                                                                   // 15
                $("body").css("padding-top", 0);                                                                       // 16
            }                                                                                                          // 17
        }],                                                                                                            // 18
        triggersExit: [function () {                                                                                   // 20
            $("body").css("padding-top", "");                                                                          // 22
        }]                                                                                                             // 23
    });                                                                                                                // 2
                                                                                                                       //
    organizationRoutes.route("/dashboard", {                                                                           // 27
        action: function action() {                                                                                    // 28
            BlazeLayout.render("fullWidthLayout", {                                                                    // 29
                content: "organizationDashboard",                                                                      // 30
                nav: "organizationNav"                                                                                 // 31
            });                                                                                                        // 29
        },                                                                                                             // 33
                                                                                                                       //
        name: "organizationDashboard"                                                                                  // 34
    });                                                                                                                // 27
                                                                                                                       //
    organizationRoutes.route("/account-settings", {                                                                    // 37
        action: function action() {                                                                                    // 38
            BlazeLayout.render("fullWidthLayout", {                                                                    // 39
                content: "accountSettingsOrganization",                                                                // 40
                nav: "organizationNav"                                                                                 // 41
            });                                                                                                        // 39
        },                                                                                                             // 43
                                                                                                                       //
        name: "accountSettings"                                                                                        // 44
    });                                                                                                                // 37
                                                                                                                       //
    organizationRoutes.route("/opportunities", {                                                                       // 47
        action: function action() {                                                                                    // 48
            BlazeLayout.render("fullWidthLayout", {                                                                    // 49
                content: "organizationOpportunities",                                                                  // 50
                nav: "organizationNav"                                                                                 // 51
            });                                                                                                        // 49
        },                                                                                                             // 53
                                                                                                                       //
        name: "organizationOpportunities"                                                                              // 54
    });                                                                                                                // 47
                                                                                                                       //
    organizationRoutes.route("/validate", {                                                                            // 57
        action: function action() {                                                                                    // 58
            BlazeLayout.render("fullWidthLayout", {                                                                    // 59
                content: "validateCredits",                                                                            // 60
                nav: "organizationNav"                                                                                 // 61
            });                                                                                                        // 59
        },                                                                                                             // 63
                                                                                                                       //
        name: "validateCredits"                                                                                        // 64
    });                                                                                                                // 57
                                                                                                                       //
    organizationRoutes.route("/accounts", {                                                                            // 67
        action: function action() {                                                                                    // 68
            BlazeLayout.render("fullWidthLayout", {                                                                    // 69
                content: "organizationAccounts",                                                                       // 70
                nav: "organizationNav"                                                                                 // 71
            });                                                                                                        // 69
        },                                                                                                             // 73
                                                                                                                       //
        name: "organizationAccounts"                                                                                   // 74
    });                                                                                                                // 67
                                                                                                                       //
    organizationRoutes.route("/settings", {                                                                            // 77
        action: function action() {                                                                                    // 78
            BlazeLayout.render("fullWidthLayout", {                                                                    // 79
                content: "organizationSettings",                                                                       // 80
                nav: "organizationNav"                                                                                 // 81
            });                                                                                                        // 79
        },                                                                                                             // 83
                                                                                                                       //
        name: "organizationSettings"                                                                                   // 84
    });                                                                                                                // 77
}));                                                                                                                   // 86
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"public.js":["../util/layout.js",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// universal/routes/public.js                                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var getNav,getLayout;module.import("../util/layout.js",{"getNav":function(v){getNav=v},"getLayout":function(v){getLayout=v}});
                                                                                                                       //
module.export("default",exports.default=(function () {                                                                 // 3
    var publicRoutes = FlowRouter.group({});                                                                           // 4
    publicRoutes.route("/", {                                                                                          // 5
        action: function action() {                                                                                    // 6
            BlazeLayout.render("home");                                                                                // 7
        },                                                                                                             // 8
                                                                                                                       //
        name: "home"                                                                                                   // 9
    });                                                                                                                // 5
                                                                                                                       //
    publicRoutes.route("/features", {                                                                                  // 12
        action: function action() {                                                                                    // 13
            BlazeLayout.render("publicLayout", {                                                                       // 14
                content: "features",                                                                                   // 15
                attr: {                                                                                                // 16
                    title: "Features",                                                                                 // 17
                    subtitle: ""                                                                                       // 18
                }                                                                                                      // 16
            });                                                                                                        // 14
        },                                                                                                             // 21
                                                                                                                       //
        name: "features"                                                                                               // 22
    });                                                                                                                // 12
                                                                                                                       //
    publicRoutes.route("/sponsor", {                                                                                   // 25
        action: function action() {                                                                                    // 26
            BlazeLayout.render("publicLayout", {                                                                       // 27
                content: "sponsor",                                                                                    // 28
                attr: {                                                                                                // 29
                    title: "Sponsor",                                                                                  // 30
                    subtitle: ""                                                                                       // 31
                }                                                                                                      // 29
            });                                                                                                        // 27
        },                                                                                                             // 34
                                                                                                                       //
        name: "sponsor"                                                                                                // 35
    });                                                                                                                // 25
                                                                                                                       //
    publicRoutes.route("/organizations", {                                                                             // 38
        action: function action() {                                                                                    // 39
            BlazeLayout.render("publicLayout", {                                                                       // 40
                content: "organizations",                                                                              // 41
                attr: {                                                                                                // 42
                    title: "Organizations",                                                                            // 43
                    subtitle: ""                                                                                       // 44
                }                                                                                                      // 42
            });                                                                                                        // 40
        },                                                                                                             // 47
                                                                                                                       //
        name: "organizations"                                                                                          // 48
    });                                                                                                                // 38
                                                                                                                       //
    publicRoutes.route("/contact", {                                                                                   // 51
        action: function action() {                                                                                    // 52
            if (!Meteor.user()) {                                                                                      // 53
                BlazeLayout.render("publicLayout", {                                                                   // 54
                    content: "contact",                                                                                // 55
                    attr: {                                                                                            // 56
                        title: "Contact Us"                                                                            // 57
                    }                                                                                                  // 56
                });                                                                                                    // 54
            } else if (Roles.userIsInRole(Meteor.user(), "organization")) {                                            // 60
                BlazeLayout.render("fullWidthLayout", {                                                                // 61
                    nav: "organizationNav",                                                                            // 62
                    content: "contact",                                                                                // 63
                    attr: {                                                                                            // 64
                        title: "Contact Us"                                                                            // 65
                    }                                                                                                  // 64
                });                                                                                                    // 61
            } else {                                                                                                   // 68
                BlazeLayout.render("layout", {                                                                         // 69
                    content: "contact",                                                                                // 70
                    attr: {                                                                                            // 71
                        title: "Contact Us"                                                                            // 72
                    }                                                                                                  // 71
                });                                                                                                    // 69
            }                                                                                                          // 75
        },                                                                                                             // 76
                                                                                                                       //
        name: "contact"                                                                                                // 77
    });                                                                                                                // 51
                                                                                                                       //
    FlowRouter.notFound = {                                                                                            // 80
        action: function action() {                                                                                    // 81
            BlazeLayout.render("publicLayout", {                                                                       // 82
                content: "404"                                                                                         // 83
            });                                                                                                        // 82
        }                                                                                                              // 85
    };                                                                                                                 // 80
}));                                                                                                                   // 87
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"user.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// universal/routes/user.js                                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export("default",exports.default=(function () {                                                                 // 1
    var userRoutes = FlowRouter.group({                                                                                // 2
        prefix: "/user",                                                                                               // 3
        triggersEnter: [function (ctx, redirect) {                                                                     // 4
            var route;                                                                                                 // 6
            if (!(Meteor.loggingIn() || Meteor.userId())) {                                                            // 7
                route = FlowRouter.current();                                                                          // 8
                if (route.route.name !== "login") {                                                                    // 9
                    Session.set("redirectAfterLogin", route.path);                                                     // 10
                }                                                                                                      // 11
                redirect("/sign-in");                                                                                  // 12
            } else if (Roles.userIsInRole(Meteor.userId(), "organization")) {                                          // 13
                redirect("/organization/dashboard");                                                                   // 14
            }                                                                                                          // 15
        }]                                                                                                             // 16
    });                                                                                                                // 2
                                                                                                                       //
    userRoutes.route("/dashboard", {                                                                                   // 20
        action: function action() {                                                                                    // 21
            BlazeLayout.render("layout", {                                                                             // 22
                content: "dashboard",                                                                                  // 23
                attr: {                                                                                                // 24
                    title: "Dashboard"                                                                                 // 25
                }                                                                                                      // 24
            });                                                                                                        // 22
        },                                                                                                             // 28
                                                                                                                       //
        name: "dashboard"                                                                                              // 29
    });                                                                                                                // 20
                                                                                                                       //
    userRoutes.route("/account-settings", {                                                                            // 32
        action: function action() {                                                                                    // 33
            BlazeLayout.render("layout", {                                                                             // 34
                content: "accountSettings",                                                                            // 35
                attr: {                                                                                                // 36
                    title: "Account Settings"                                                                          // 37
                }                                                                                                      // 36
            });                                                                                                        // 34
        },                                                                                                             // 40
                                                                                                                       //
        name: "accountSettings"                                                                                        // 41
    });                                                                                                                // 32
                                                                                                                       //
    userRoutes.route("/request-credits", {                                                                             // 45
        action: function action() {                                                                                    // 46
            BlazeLayout.render("layout", {                                                                             // 47
                content: "requestCredits",                                                                             // 48
                attr: {                                                                                                // 49
                    title: "Request Credit Validation",                                                                // 50
                    subtitle: "After volunteering, the organizer of the volunteer opportunity will validate your credits."
                }                                                                                                      // 49
            });                                                                                                        // 47
        },                                                                                                             // 54
                                                                                                                       //
        name: "requestCredits"                                                                                         // 55
    });                                                                                                                // 45
                                                                                                                       //
    userRoutes.route("/redeem-credits", {                                                                              // 58
        subscriptions: function subscriptions() {                                                                      // 59
            this.register("items", Meteor.subscribe("items"));                                                         // 60
        },                                                                                                             // 61
        action: function action() {                                                                                    // 62
            BlazeLayout.render("layout", {                                                                             // 63
                content: "redeemCredits",                                                                              // 64
                attr: {                                                                                                // 65
                    title: "Redeem Credits",                                                                           // 66
                    subtitle: "Purchase e-vouchers, coupons, etc. using credits"                                       // 67
                }                                                                                                      // 65
            });                                                                                                        // 63
        },                                                                                                             // 70
                                                                                                                       //
        name: "redeemCredits"                                                                                          // 71
    });                                                                                                                // 58
                                                                                                                       //
    userRoutes.route("/volunteer-opportunities", {                                                                     // 74
        action: function action() {                                                                                    // 75
            BlazeLayout.render("layout", {                                                                             // 76
                content: "volunteerOpportunities",                                                                     // 77
                attr: {                                                                                                // 78
                    title: "Volunteer Opportunities",                                                                  // 79
                    subtitle: "Find and sign up for nearby volunteer opportunities."                                   // 80
                }                                                                                                      // 78
            });                                                                                                        // 76
        },                                                                                                             // 83
                                                                                                                       //
        name: "volunteerOpportunities"                                                                                 // 84
    });                                                                                                                // 74
}));                                                                                                                   // 86
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"util":{"layout.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// universal/util/layout.js                                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({getLayout:function(){return getLayout},getNav:function(){return getNav}});function getLayout() {        // 1
    if (!Meteor.userId()) {                                                                                            // 2
        $("body").css("padding-top", "");                                                                              // 3
        return "layout";                                                                                               // 4
    } else if (Roles.userIsInRole(Meteor.userId(), "organization")) {                                                  // 5
        $("body").css("padding-top", 0);                                                                               // 6
        return "fullWidthLayout";                                                                                      // 7
    } else {                                                                                                           // 8
        $("body").css("padding-top", "");                                                                              // 9
        return "layout";                                                                                               // 10
    }                                                                                                                  // 11
}                                                                                                                      // 12
                                                                                                                       //
function getNav() {                                                                                                    // 14
    if (!Meteor.userId()) {                                                                                            // 15
        return "publicNav";                                                                                            // 16
    } else if (Roles.userIsInRole(Meteor.userId(), "organization")) {                                                  // 17
        return "organizationNav";                                                                                      // 18
    } else {                                                                                                           // 19
        return "userNav";                                                                                              // 20
    }                                                                                                                  // 21
}                                                                                                                      // 22
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"config.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// universal/config.js                                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export("default",exports.default=({                                                                             // 1
    name: "Big Thanks",                                                                                                // 2
    description: "A system which helps encourage citizens to do volunteer work using a credit system which allows them to earn rewards."
}));                                                                                                                   // 1
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"debug.js":function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// universal/debug.js                                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export("default",exports.default=(function () {                                                                 // 1
    if (Meteor.isClient) {                                                                                             // 2
        Meteor.startup(function () {                                                                                   // 3
            Meteor.setTimeout(function () {                                                                            // 4
                //Meteor.call("client.restarted");                                                                     //
            }, 500);                                                                                                   // 6
        });                                                                                                            // 7
    }                                                                                                                  // 8
                                                                                                                       //
    if (Meteor.isServer) {                                                                                             // 10
        (function () {                                                                                                 // 10
            var exec = Npm.require("child_process").exec;                                                              // 11
            Meteor.startup(function () {                                                                               // 12
                exec("if [ \"$(uname)\" == \"Darwin\" ]; then /usr/bin/osascript -e \"display notification \\\"Server Restarted\\\" with title \\\"Meteor\\\"\"; fi;");
                Meteor.methods({                                                                                       // 14
                    "client.restarted": function clientRestarted() {                                                   // 15
                        exec("if [ \"$(uname)\" == \"Darwin\" ]; then /usr/bin/osascript -e \"display notification \\\"Client Restarted\\\" with title \\\"Meteor\\\"\"; fi;");
                    }                                                                                                  // 17
                });                                                                                                    // 14
            });                                                                                                        // 19
        })();                                                                                                          // 10
    }                                                                                                                  // 20
}));                                                                                                                   // 21
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{"extensions":[".js",".json"]});
require("./server/config/email.js");
require("./server/config/reCaptcha.js");
require("./server/config/security.js");
require("./server/methods/organization.js");
require("./server/methods/user.js");
require("./universal/config/accounts.js");
require("./universal/routes/accounts.js");
require("./universal/routes/organization.js");
require("./universal/routes/public.js");
require("./universal/routes/user.js");
require("./universal/util/layout.js");
require("./server/entry.js");
require("./universal/config.js");
require("./universal/debug.js");
//# sourceMappingURL=app.js.map
