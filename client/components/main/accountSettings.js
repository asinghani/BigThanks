import { Template } from 'meteor/templating';

import "./accountSettings.html";

Template.accountSettings.events({
    "submit #changesForm"(event){
        event.preventDefault();

        let form = event.target;

        if(form.name.value !== Meteor.user().profile.name && form.name.value !== ""){
            Meteor.call("user.updateName", form.name.value)
        }

        alertify.alert("Successfully changed account settings. Changes may take up to 1-2 minutes to appear.", () => {
            FlowRouter.go("/dashboard");
        });
    }
});

Template.accountSettings.onRendered(() => {
    if(!this._rendered) {
        this._rendered = true;
        $("#name").text(Meteor.user().profile.name);
    }
}