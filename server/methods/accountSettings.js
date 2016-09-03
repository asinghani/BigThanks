import { Organizations } from "/imports/api/organizations.js";
import { Email } from "meteor/email";

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
    }, "contact.submit"(name, email, subject, message){
        let confirmation = `
            Big Thanks contact form has been submitted. You will receive a reply in 1-2 business days.
            <h3>Submitted Information:</h3>
            <hr>
            <span style="font-weight:bold;">Name</span>
            <br>
            ${name}
            <br>
            <br>
            <span style="font-weight:bold;">Email</span>
            <br>
            ${email}
            <br>
            <br>
            <span style="font-weight:bold;">Subject</span>
            <br>
            ${subject}
            <br>
            <br>
            <span style="font-weight:bold;">Message</span>
            <br>
            ${message}
            <br>
            <br>
            Please do not reply to this email.
        `;

        let emailMsg = `
            Big Thanks contact form was submitted.
            <h3>Submitted Information:</h3>
            <hr>
            <span style="font-weight:bold;">Name</span>
            <br>
            ${name}
            <br>
            <br>
            <span style="font-weight:bold;">Email</span>
            <br>
            ${email}
            <br>
            <br>
            <span style="font-weight:bold;">Subject</span>
            <br>
            ${subject}
            <br>
            <br>
            <span style="font-weight:bold;">Message</span>
            <br>
            ${message}
            <br>
        `;

        Email.send({
            from: Meteor.settings.private.email.no_reply,
            to: email,
            replyTo: Meteor.settings.private.email.contact,
            subject: "Contact form submitted",
            html: confirmation
        });

        Email.send({
            from: name+" <"+email+">",
            to: Meteor.settings.private.email.contact,
            replyTo: email,
            subject: "Contact Form: "+subject,
            html: emailMsg
        });

    }
});