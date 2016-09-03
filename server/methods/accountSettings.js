import { Organizations } from "/imports/api/organizations.js";

Meteor.methods({
    "user.updateName"(name) {
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.name": name}});
    }, "organization.update"(name, website) {
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        Organizations.update({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}, {$set: {name: name, website: website}});
    }, "user.resetPassword"() {
        if (!this.userId) {
            throw new Meteor.Error("not-authorized");
        }
        Accounts.sendResetPasswordEmail(this.userId);
    }, "user.resetPasswordOther"(id) {
        if (!id) {
            throw new Meteor.Error("not-authorized");
        }
        Accounts.sendResetPasswordEmail(id);
    }, "user.get"(id){
        return Meteor.users.find({_id: id}).fetch()[0];
    }, "user.delete"(id){
        Meteor.users.remove({_id: id});
    }, "user.permission.set"(id, permission){
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
    }, "organization.user.add"(email, organization){
        let id = Accounts.findUserByEmail(email)._id;

        Meteor.users.update({ _id: id}, {$set: {
            "profile.organization": organization
        }});

        Organizations.update({ _id: new Mongo.ObjectID(organization) }, {$push: {
            users: id
        }});

        Roles.addUsersToRoles(id, "organization");
        Roles.addUsersToRoles(id, "organization_opportunities");
        Roles.addUsersToRoles(id, "organization_validate");
    }
});