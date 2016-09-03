import { Mongo } from "meteor/mongo";

export const Organizations = new Mongo.Collection("organizations");

if(Meteor.isServer) {
    Meteor.methods({
        "opportunity.delete"(id){
            Organizations.update({_id: new Mongo.ObjectID(Meteor.user().profile.organization), "opportunities._id": id}, {
                $set: {"opportunities.$.deleted": true }
            });
        },"opportunity.update"(id, opportunity){
            Organizations.update({_id: new Mongo.ObjectID(Meteor.user().profile.organization), "opportunities._id": id}, {
                $set: {"opportunities.$": opportunity }
            });
        },"opportunity.insert"(opportunity){
            opportunity._id = new Mongo.ObjectID()._str;
            Organizations.update({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}, {
                $push: {"opportunities": opportunity }
            });
        }
    });
}
