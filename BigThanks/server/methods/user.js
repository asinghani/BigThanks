import { Organizations } from "/imports/api/organizations.js";
import { Email } from "meteor/email";

Meteor.methods({

    /**
     * Mark a history item / validation as already viewed
     */
    "user.history.resetNew"(id) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Meteor.users.update({_id: Meteor.userId(), "profile.history._id" : id}, {$set: {"profile.history.$.new": false}});
    },

    /**
     * Send a credit validation request
     */
    "request.send"(opportunityName, time, organizationId){
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        let id = new Mongo.ObjectID()._str;
        let timestamp = moment().unix();
        Meteor.users.update({ _id: Meteor.userId() }, {$push: {
            "profile.history": {
                _id: id,
                timestamp: timestamp,
                opportunity: opportunityName,
                length: time,
                credits: time,
                validator: organizationId,
                status: 0,
                new: false,
                comment: ""
            }
        }});
        Organizations.update({ _id: new Mongo.ObjectID(organizationId) }, {$push: {
            requests: {
                _id: id,
                userId: Meteor.userId(),
                reqId: id,
                name: opportunityName,
                time: time,
                timestamp: timestamp,
                userName: Meteor.user().profile.name
            }
        }});
    },

    /**
     * Update user's name
     */
    "user.updateName"(name) {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        if(!name){
            throw new Meteor.Error("invalid-args")
        }

        Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.name": name}});
    },

    /**
     * Send reset password email
     */
    "user.resetPassword"() {
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }

        Accounts.sendResetPasswordEmail(Meteor.userId());
    },

    /**
     * Contact form submitted
     */
    "contact.submit"(name, email, subject, message){
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

    },

    /**
     * Initial Tour Ended, reset firstLogin flag
     *
     */
    "user.tour.ended"(){
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.firstLogin": false}});
    },

    /**
     * Restart the tour for user
     */
    "user.tour.restart"(){
        if (!Meteor.userId()) {
            throw new Meteor.Error("not-authorized");
        }
        Meteor.users.update({ _id: Meteor.userId()}, {$set: { "profile.firstLogin": true }});
    }
});