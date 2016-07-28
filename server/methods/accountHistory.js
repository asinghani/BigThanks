Meteor.methods({
    "user.history.resetNew"(id) {
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update({_id: Meteor.userId(), "profile.history.timestamp" : id}, {$set: {"profile.history.$.new": false}})
    }
});