import { Mongo } from "meteor/mongo";

export const Organizations = new Mongo.Collection("organizations");

if(Meteor.isServer) {
    Meteor.methods({
        /**
         * Delete volunteer opportunity
         *
         * Required permission: Organization Opportunities
         */
        "opportunity.delete"(id){
            if (!id) {
                throw new Meteor.Error("invalid-args");
            }

            if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), ["organization_admin", "organization_opportunities"])) {
                throw new Meteor.Error("not-authorized");
            }

            Organizations.update({_id: new Mongo.ObjectID(Meteor.user().profile.organization), "opportunities._id": id}, {
                $set: {"opportunities.$.deleted": true }
            });
        },"opportunity.update"(id, opportunity){
            if (!id || !opportunity) {
                throw new Meteor.Error("invalid-args");
            }

            if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), ["organization_admin", "organization_opportunities"])) {
                throw new Meteor.Error("not-authorized");
            }

            Organizations.update({_id: new Mongo.ObjectID(Meteor.user().profile.organization), "opportunities._id": id}, {
                $set: {"opportunities.$": opportunity }
            });
        },"opportunity.insert"(opportunity){
            if (!opportunity) {
                throw new Meteor.Error("invalid-args");
            }

            if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), ["organization_admin", "organization_opportunities"])) {
                throw new Meteor.Error("not-authorized");
            }

            opportunity._id = new Mongo.ObjectID()._str;
            Organizations.update({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}, {
                $push: {"opportunities": opportunity }
            });
        },"opportunity.register"(organization, opportunity){
            if (!organization || !opportunity) {
                throw new Meteor.Error("invalid-args");
            }

            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            let email = Meteor.user().emails[0].address;

            if(Organizations.find({_id: new Mongo.ObjectID(organization), "opportunities._id": opportunity,
                    "opportunities.registrations.email": email}).fetch().length > 0){
                return;
            }

            Organizations.update({_id: new Mongo.ObjectID(organization), "opportunities._id": opportunity}, {
                $push: {"opportunities.$.registrations": {
                    _id: new Mongo.ObjectID()._str,
                    name: Meteor.user().profile.name,
                    email: email,
                    timestamp: moment().unix()
                }}
            });
        }
    });
}
