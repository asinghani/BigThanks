import { Organizations } from "/imports/api/organizations.js";

const validEmail = /.+@.+/;

Meteor.methods({
    /**
     * Update organization settings
     *
     * Required Permission: Organization Admin
     */
    "organization.update"(name, website, logo) {
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {
            throw new Meteor.Error("not-authorized");
        }
        Organizations.update({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}, {$set: {name: name, website: website, logo: logo}});
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
    "organization.user.add"(email, name){

        if (!email) {
            throw new Meteor.Error("invalid-args");
        }

        if(!name || name.length == 0) {
            name = email.split("@")[0];
        }

        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "organization_admin")) {
            throw new Meteor.Error("not-authorized");
        }

        Accounts.createUser({
            email: email,
            profile: {
                name: name,
                organization: Meteor.user().profile.organization,
                firstLogin: true
            }
        });

        let id = Accounts.findUserByEmail(email)._id;

        if (!id) {
            throw new Meteor.Error("invalid-args");
        }

        Accounts.sendEnrollmentEmail(id);

        let user = Meteor.users.find({_id: id}).fetch()[0];
        if (!user || !user.profile) {
            throw new Meteor.Error("invalid-args");
        }

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

        let user = Meteor.users.find({_id: userId}).fetch()[0];
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
    },

    "organization.request.submit" (name, organizationName, email, website, message) {
        let confirmation = `
            Your request for your organization to join Big Thanks has been submitted.
            You will recieve further instructions in 3-5 business days after an admin reviews your information.
            <h3>Submitted Information:</h3>
            <hr>
            <span style="font-weight:bold;">Name</span>
            <br>
            ${name}
            <br>
            <br>
            <span style="font-weight:bold;">Organization Name</span>
            <br>
            ${organizationName}
            <br>
            <br>
            <span style="font-weight:bold;">Email</span>
            <br>
            ${email}
            <br>
            <br>
            <span style="font-weight:bold;">Website</span>
            <br>
            <a href="${website}">${website}</a>
            <br>
            <br>
            <span style="font-weight:bold;">Message</span>
            <br>
            ${message}
            <br>
            <br>
        `;

        let emailMsg = `
            An organization join request was submitted
            <h3>Submitted Information:</h3>
            <hr>
            <span style="font-weight:bold;">Name</span>
            <br>
            ${name}
            <br>
            <br>
            <span style="font-weight:bold;">Organization Name</span>
            <br>
            ${organizationName}
            <br>
            <br>
            <span style="font-weight:bold;">Email</span>
            <br>
            ${email}
            <br>
            <br>
            <span style="font-weight:bold;">Website</span>
            <br>
            <a href="${website}">${website}</a>
            <br>
            <br>
            <span style="font-weight:bold;">Message</span>
            <br>
            ${message}
            <br>
            <br>
        `;

        Email.send({
            from: Meteor.settings.private.email.no_reply,
            to: email,
            replyTo: Meteor.settings.private.email.contact,
            subject: "Big Thanks organization join request submitted",
            html: confirmation
        });

        Email.send({
            from: name+" <"+email+">",
            to: Meteor.settings.private.email.contact,
            replyTo: email,
            subject: "Organization Join Form: "+organizationName,
            html: emailMsg
        });
    },

    "sponsor.request.submit" (name, companyName, email, website, message) {
        let confirmation = `
            Big Thanks sponsor form has been submitted. An admin will review this information and respond within 3-5 days.
            <h3>Submitted Information:</h3>
            <hr>
            <span style="font-weight:bold;">Name</span>
            <br>
            ${name}
            <br>
            <br>
            <span style="font-weight:bold;">Company Name</span>
            <br>
            ${companyName}
            <br>
            <br>
            <span style="font-weight:bold;">Email</span>
            <br>
            ${email}
            <br>
            <br>
            <span style="font-weight:bold;">Website</span>
            <br>
            <a href="${website}">${website}</a>
            <br>
            <br>
            <span style="font-weight:bold;">Message</span>
            <br>
            ${message}
            <br>
            <br>
        `;

        let emailMsg = `
            A sponsor join request was submitted
            <h3>Submitted Information:</h3>
            <hr>
            <span style="font-weight:bold;">Name</span>
            <br>
            ${name}
            <br>
            <br>
            <span style="font-weight:bold;">Company Name</span>
            <br>
            ${companyName}
            <br>
            <br>
            <span style="font-weight:bold;">Email</span>
            <br>
            ${email}
            <br>
            <br>
            <span style="font-weight:bold;">Website</span>
            <br>
            <a href="${website}">${website}</a>
            <br>
            <br>
            <span style="font-weight:bold;">Message</span>
            <br>
            ${message}
            <br>
            <br>
        `;

        Email.send({
            from: Meteor.settings.private.email.no_reply,
            to: email,
            replyTo: Meteor.settings.private.email.contact,
            subject: "Big Thanks sponsor form submitted",
            html: confirmation
        });

        Email.send({
            from: name+" <"+email+">",
            to: Meteor.settings.private.email.contact,
            replyTo: email,
            subject: "Big Thanks Sponsor Form: "+companyName,
            html: emailMsg
        });
    }, "organization.add" (organizationName, website, adminName, email) {
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

        Meteor.users.update({_id: id}, {$set: {"profile.organization": organizationId._str}});

        Accounts.sendEnrollmentEmail(id);

    }
});