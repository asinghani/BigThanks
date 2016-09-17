import { Template } from "meteor/templating";

import "./organizations.html";

var spinner = "<i class=\"fa fa-spinner fa-pulse fa-lg\" style=\"filter: blur(0);\"></i>";

Template.organizations.events({
    "submit #organizationForm"(event){
        event.preventDefault();

        let form = event.target;

        if(form.name.value === "" || form.organizationName.value === "" || form.email.value === "" || form.websiteURL.value === "" || form.message.value === ""){
            $("#fill-all").css("display", "block");
            return;
        }

        $("#submit-btn").removeClass("btn-outline").html(spinner+" Submitting...").attr("disabled", "false");

        Meteor.call("organization.request.submit", form.name.value, form.organizationName.value, form.email.value, form.websiteURL.value, form.message.value, (err) => {
            if(err){
                swal("Error", "An internal error has occurred. Please try again later", "error");
                return;
            }
            swal("Submitted", "Your request for your organization to join Big Thanks has been submitted." +
                "You will recieve further instructions in 3-5 business days after an admin reviews your information.", "success");

            $("#name").val("");
            $("#organizationName").val("");
            $("#websiteURL").val("");
            $("#email").val("");
            $("#message").val("");

            $("#submit-btn").addClass("btn-outline").html("Submit").attr("disabled", "false");
        });

    }
});

Template.organizations.onRendered(() => {
    Meteor.setTimeout(() => {
        $("#name").val("");
        $("#organizationName").val("");
        $("#websiteURL").val("");
        $("#email").val("");
        $("#message").val("");
    }, 0);
});