import { Organizations } from "/imports/api/organizations.js";
Meteor.methods({
    "user.history.resetNew"(id) {
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update({_id: Meteor.userId(), "profile.history._id" : id}, {$set: {"profile.history.$.new": false}});
    },
    "request.send"(opportunityName, time, organizationId){
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
    "request.update"(opportunityName, time, organizationId){
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
    "request.confirm"(userId, organizationId, reqId, status, comment, length){
        let oldCredits = parseInt(Meteor.users.find({_id: userId}).fetch()[0].profile.credits);
        let totalTime = parseInt(Meteor.users.find({_id: userId}).fetch()[0].profile.totalHours);
        length = parseInt(length);
        if(status == 2) length = 0;
        Meteor.users.update({ _id: userId, "profile.history._id": reqId}, {$set: {
            "profile.history.$.status": status,
            "profile.history.$.comment": comment,
            "profile.history.$.new": true,
            "profile.credits": (oldCredits + length),
            "profile.totalHours": (totalTime + Math.ceil(length/60))
        }});
        Organizations.update({ _id: new Mongo.ObjectID(organizationId) }, {$pull: {
            requests: {
                _id: reqId
            }
        }});
    }
});