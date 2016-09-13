import { Template } from "meteor/templating";
import { Organizations } from "/imports/api/organizations.js";

import "./organizationSettings.html";

Template.organizationSettings.events({
    "submit #changesForm"(event){
        event.preventDefault();

        let form = event.target;

        if(form.name.value !== "" && form.website.value !== "" && form.logo.value !== ""){
            Meteor.call("organization.update", form.name.value, form.website.value, form.logo.value);
        }

        swal({
            title: "Success",
            text: "Successfully changed organization settings.",
            type: "success"
        });
    },
    "keyup #logo"(event){
        let url = $("#logo").val();
        $("#logoImg").attr("src", url);
    },
    "change #logo"(event){
        let url = $("#logo").val();
        $("#logoImg").attr("src", url);
    }
});

Template.organizationSettings.onRendered(() => {
    Meteor.setTimeout(() => {
        let organization = Organizations.find({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}).fetch()[0];
        $("#name").val(organization.name);
        $("#website").val(organization.website);
        $("#logo").val(organization.logo);
        $("#logoImg").attr("src", organization.logo).css("display", "initial");
    }, 100);
});