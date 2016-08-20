import { Template } from "meteor/templating";

import "./verifyEmail.html";

Template.verifyEmail.helpers({
    unverified(){
        return !Meteor.user().emails[0].verified;
    }
});
