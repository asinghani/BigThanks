Meteor.methods({
    "user.updateName"(name) {
        if (!this.userId) {
            throw new Meteor.Error('not-authorized');
        }
        Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.name": name}})
    }
});