import { Template } from "meteor/templating";

import "./sponsor.html";

var spinner = "<i class=\"fa fa-spinner fa-pulse fa-lg\" style=\"filter: blur(0);\"></i>";

Template.sponsor.events({
    "submit #sponsorForm"(event){
        event.preventDefault();

        let form = event.target;

        if(form.name.value === "" || form.companyName.value === "" || form.email.value === "" || form.websiteURL.value === "" || form.message.value === ""){
            $("#fill-all").css("display", "block");
            return;
        }

        $("#submit-btn").removeClass("btn-outline").html(spinner+" Submitting...").attr("disabled", "false");

        Meteor.call("sponsor.request.submit", form.name.value, form.companyName.value, form.email.value, form.websiteURL.value, form.message.value, (err) => {
            if(err){
                swal("Error", "An internal error has occurred. Please try again later", "error");
                return;
            }
            swal("Submitted", "Big Thanks sponsor form has been submitted. An admin will review this information and respond within 3-5 days.", "success");

            $("#name").val("");
            $("#companyName").val("");
            $("#websiteURL").val("");
            $("#email").val("");
            $("#message").val("");

            $("#submit-btn").addClass("btn-outline").html("Submit").attr("disabled", "false");
        });

    }
});

Template.sponsor.onRendered(() => {
    Meteor.setTimeout(() => {
        $("#name").val("");
        $("#companyName").val("");
        $("#websiteURL").val("");
        $("#email").val("");
        $("#message").val("");
    }, 0);
});