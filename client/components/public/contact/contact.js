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

        $("#submit-btn").removeClass("btn-outline").html(spinner+" Submitting...");

        Meteor.call("contact.submit", form.name.value, form.email.value, form.subject.value, form.message.value, () => {
            swal("Submitted", "The contact form has been submitted. You will receive an email confirmation soon, and a reply in 1-2 business days.",
                "success");

            $("#name").val("");
            $("#email").val("");
            $("#subject").val("");
            $("#message").val("");

            $("#submit-btn").addClass("btn-outline").html("Submit");
        });

    }
});

var email = "Y29udGFjdA==";
var email2 = "YW5pc2hzaW5naGFuaS5jb20=";

Template.contact.onRendered(() => {
    Meteor.setTimeout(() => {
        $("#name").val("");
        $("#email").val("");
        $("#subject").val("");
        $("#message").val("");

        let e = atob(email) + "@" + atob(email2);

        $("#contact-email").html(e).attr("href", "mailto:"+e);
    }, 0);
});