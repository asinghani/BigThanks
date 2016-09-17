const validEmail = /.+@.+/;

import { Organizations, Items } from "/imports/collections.js";

Meteor.methods({
    "organization.add" (organizationName, website, adminName, email) {
        if (!organizationName || !website || !adminName || !email) {
            throw new Meteor.Error("invalid-args");
        }

        if (!validEmail.exec(email)) {
            throw new Meteor.Error("invalid-args");
        }

        if(!Meteor.userId()){
            throw new Meteor.Error("not-authorized");
        }

        try {

            Accounts.createUser({
                email: email,
                profile: {
                    name: adminName,
                    firstLogin: true
                }
            });
        }catch(err){
            if(err.reason.indexOf("Email already exists") == -1) return;
        }

        let id = Accounts.findUserByEmail(email)._id;

        if (!id) {
            throw new Meteor.Error("invalid-args");
        }

        Roles.addUsersToRoles(id, "organization");
        Roles.addUsersToRoles(id, "organization_admin");
        Roles.addUsersToRoles(id, "organization_super_admin");


        let user = Meteor.users.find({_id: id}).fetch()[0];
        if (!user || !user.profile) {
            throw new Meteor.Error("invalid-args");
        }

        Accounts.sendEnrollmentEmail(id);

        let organizationId = new Mongo.ObjectID();

        Organizations.insert({
            "_id" : organizationId,
            "name" : organizationName,
            "website" : website,
            "logo" : "/default_logo.jpg",
            "requests" : [],
            "opportunities" : [],
            "users" : [ id ]
        });

        Meteor.users.update({_id: id}, {$set: {"profile.organization": organizationId}});
    }
});