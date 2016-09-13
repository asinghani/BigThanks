import { Template } from "meteor/templating";

import "./accountSettings.html";

Template.accountSettingsOrganization.events({
    "submit #changesForm"(event){
        event.preventDefault();

        let form = event.target;

        if(form.name.value !== Meteor.user().profile.name && form.name.value !== ""){
            Meteor.call("user.updateName", form.name.value);
        }

        swal({
            title: "Success",
            text: "Successfully changed account settings. Changes may take up to 30 seconds to appear.",
            type: "success"
        }, () => {
            FlowRouter.go("/organization/dashboard");
        });
    },
    "click #change-password"(event){
        event.preventDefault();

        let options = {
            title: "Are you sure?",
            text: "For security reasons, you will receive an email to change your password.",

            showCancelButton: true,
            confirmButtonText: "Change Password",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        };

        swal(options, () => {
            Meteor.call("user.resetPassword", () => {
                setTimeout(() => {
                    swal("Password has been changed", "Check your email to set your new password.", "success");
                }, 500);
            });
        });
    }
});

Template.accountSettingsOrganization.onRendered(() => {
    Meteor.setTimeout(() => {
        $("#name").val(Meteor.user().profile.name);
    }, 0);
});