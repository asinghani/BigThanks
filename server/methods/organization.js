import { Organizations } from "/imports/api/organizations.js";

Meteor.methods({
    /**
     * Update organization settings
     *
     * Required Permission: Organization Admin
     */
    "organization.update"(name, website) {
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {
            throw new Meteor.Error("not-authorized");
        }
        Organizations.update({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}, {$set: {name: name, website: website}});
    },

    /**
     * Reset password of user in organization
     *
     * Required Permission: Organization Admin
     */
    "organization.user.resetPassword"(id) {
        if (!id) {
            throw new Meteor.Error("invalid-args");
        }
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {
            throw new Meteor.Error("not-authorized");
        }
        Accounts.sendResetPasswordEmail(id);
    },

    /**
     * Get user object for specific user in organization
     *
     * Required Permission: Organization Admin
     */
    "organization.user.get"(id, render){
        if (!id) {
            throw new Meteor.Error("invalid-args");
        }
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {
            throw new Meteor.Error("not-authorized");
        }

        let user = Meteor.users.find({_id: id}).fetch()[0];
        if (!user || !user.profile) {
            throw new Meteor.Error("invalid-args");
        }
        if(user.profile.organization !== Meteor.user().profile.organization){
            throw new Meteor.Error("not-authorized");
        }

        return user;
    },

    /**
     * Delete a user
     *
     * Required Permission: Organization Admin
     */
    "organization.user.delete"(id){
        if (!id) {
            throw new Meteor.Error("invalid-args");
        }
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {
            throw new Meteor.Error("not-authorized");
        }

        let user = Meteor.users.find({_id: id}).fetch()[0];
        if (!user || !user.profile) {
            throw new Meteor.Error("invalid-args");
        }
        if(user.profile.organization !== Meteor.user().profile.organization){
            throw new Meteor.Error("not-authorized");
        }

        Meteor.users.remove({_id: id});

        return true;
    },

    /**
     * Change permissions of a user
     *
     * Required Permission: Organization Admin
     */
    "organization.user.permission.set"(id, permission){
        if (!id || !permission) {
            throw new Meteor.Error("invalid-args");
        }
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {
            throw new Meteor.Error("not-authorized");
        }

        let user = Meteor.users.find({_id: id}).fetch()[0];
        if (!user || !user.profile) {
            throw new Meteor.Error("invalid-args");
        }
        if(user.profile.organization !== Meteor.user().profile.organization){
            throw new Meteor.Error("not-authorized");
        }

        Roles.removeUsersFromRoles(id, ["organization_opportunities", "organization_admin", "organization_validate"]);
        switch(permission){

        case "admin":
            Roles.addUsersToRoles(id, "organization_admin");
            break;
        case "opportunities":
            Roles.addUsersToRoles(id, "organization_opportunities");
            break;
        case "validate":
            Roles.addUsersToRoles(id, "organization_validate");
            break;
        case "opportunities_validate":
            Roles.addUsersToRoles(id, "organization_opportunities");
            Roles.addUsersToRoles(id, "organization_validate");
            break;

        }
        return true;
    },

    /**
     * Add a user to organization
     *
     * Required Permission: Organization Admin
     */
    "organization.user.add"(email){

        if (!email) {
            throw new Meteor.Error("invalid-args");
        }

        let id = Accounts.findUserByEmail(email)._id;

        if (!id) {
            throw new Meteor.Error("invalid-args");
        }
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {
            throw new Meteor.Error("not-authorized");
        }

        let user = Meteor.users.find({_id: id}).fetch()[0];
        if (!user || !user.profile) {
            throw new Meteor.Error("invalid-args");
        }

        Meteor.users.update({ _id: id}, {$set: {
            "profile.organization": Meteor.user().profile.organization,
            "profile.firstLogin": true
        }});

        Organizations.update({ _id: new Mongo.ObjectID(Meteor.user().profile.organization) }, {$push: {
            users: id
        }});

        Roles.addUsersToRoles(id, "organization");
        Roles.addUsersToRoles(id, "organization_opportunities");
        Roles.addUsersToRoles(id, "organization_validate");
    },

    /**
     * Confirm/Deny credit request
     *
     * Required Permission: Organization Validate
     */
    "organization.request.confirm" (userId, organizationId, reqId, status, comment, length){

        if (!userId || !organizationId || !reqId || !status || !length) {
            throw new Meteor.Error("invalid-args");
        }

        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), ["organization_admin", "organization_validate"])) {
            throw new Meteor.Error("not-authorized");
        }

        if(organizationId !== Meteor.user().profile.organization){
            throw new Meteor.Error("not-authorized");
        }

        let user = Meteor.users.find({_id: id}).fetch()[0];
        if (!user || !user.profile) {
            throw new Meteor.Error("invalid-args");
        }

        let oldCredits = parseInt(Meteor.users.find({_id: userId}).fetch()[0].profile.credits);
        let totalTime = parseInt(Meteor.users.find({_id: userId}).fetch()[0].profile.totalHours);

        length = parseInt(length);
        if(status == 2) length = 0;

        Meteor.users.update({ _id: userId, "profile.history._id": reqId}, {$set: {
            "profile.history.$.status": status,
            "profile.history.$.comment": comment,
            "profile.history.$.new": true
        }, $inc: {
            "profile.credits": length,
            "profile.totalHours": Math.ceil(length/60)
        }});

        Organizations.update({ _id: new Mongo.ObjectID(organizationId) }, {$pull: {
            requests: {
                _id: reqId
            }
        }});
    }
});