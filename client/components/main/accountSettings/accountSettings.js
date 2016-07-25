import { Template } from 'meteor/templating';

import "./accountSettings.html";

Template.accountSettings.events({
    "submit #changesForm"(event){
        event.preventDefault();

        let form = event.target;

        if(form.name.value !== Meteor.user().profile.name && form.name.value !== ""){
            Meteor.call("user.updateName", form.name.value)
        }

        swal({
            title: "Success",
            text: "Successfully changed account settings. Changes may take up to 30 seconds to appear.",
            type: "success"
        }, () => {
            FlowRouter.go("/dashboard");
        });
    }
});

Template.accountSettings.onRendered(() => {
    $("#name").val(Meteor.user().profile.name);
});