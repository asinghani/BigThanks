import { Template } from "meteor/templating";

import "./contact.html";

Template.contact.events({
    "submit #contactForm"(event){
        event.preventDefault();

        let form = event.target;

        if(form.name.value === "" || form.email.value === "" || form.subject.value === "" || form.message.value === ""){
            $("#fill-all").css("display", "block");
            return;
        }

        Meteor.call("contact.submit", form.name.value, form.email.value, form.subject.value, form.message.value, () => {
            swal("Submitted", "The contact form has been submitted. You will receive an email confirmation soon, and a reply in 1-2 business days.",
                "success");

            $("#name").val("");
            $("#email").val("");
            $("#subject").val("");
            $("#message").val("");
        });

    }
});

Template.organizationSettings.onRendered(() => {
    Meteor.setTimeout(() => {
        $("#name").val("");
        $("#email").val("");
        $("#subject").val("");
        $("#message").val("");
    }, 0);
});