import { Template } from "meteor/templating";

import "./contact.html";

var spinner = "<i class=\"fa fa-spinner fa-pulse fa-lg\" style=\"filter: blur(0);\"></i>";

Template.contact.events({
    "submit #contactForm"(event){
        event.preventDefault();

        let form = event.target;

        if(form.name.value === "" || form.email.value === "" || form.subject.value === "" || form.message.value === ""){
            $("#fill-all").css("display", "block");
            return;
        }

        $("#submit-btn").removeClass("btn-outline").html(spinner+" Submitting...").attr("disabled", "false");

        Meteor.call("contact.submit", form.name.value, form.email.value, form.subject.value, form.message.value, (err) => {
            if(err){
                swal("Error", "An internal error has occurred. Please try again later", "error");
                return;
            }
            swal("Submitted", "The contact form has been submitted. You will receive an email confirmation soon, and a reply in 1-2 business days.",
                "success");

            $("#name").val("");
            $("#email").val("");
            $("#subject").val("");
            $("#message").val("");

            $("#submit-btn").addClass("btn-outline").html("Submit").attr("disabled", "false");
        });

    }
});

var email = "Y29udGFjdA==";
var email2 = "YmlndGhhbmtzLmlv";

Template.contact.onRendered(() => {
    Meteor.setTimeout(() => {
        $("#name").val("");
        $("#email").val("");
        $("#subject").val("");
        $("#message").val("");

        let e = atob(email) + "@" + atob(email2);

        $("#contact-email").html(e).attr("href", "mailto:"+e);

        if(Meteor.user() && Meteor.user().emails[0].address && Meteor.user().profile.name){
            $("#name").val(Meteor.user().profile.name);
            $("#email").val(Meteor.user().emails[0].address);
        }
    }, 0);
});