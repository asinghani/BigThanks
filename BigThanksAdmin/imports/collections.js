let connection = DDP.connect("http://localhost:3000");

var Organizations = new Mongo.Collection("organizations", {
    connection: connection
});

var Items = new Mongo.Collection("items", {
    connection: connection
});

if(Meteor.isServer) {
    Organizations.allow({
        insert() { return Meteor.userId(); },
        update() { return Meteor.userId(); },
        remove() { return Meteor.userId(); }
    });

    Items.allow({
        insert() { return Meteor.userId(); },
        update() { return Meteor.userId(); },
        remove() { return Meteor.userId(); }
    });

}

export {Organizations, Items};