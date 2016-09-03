import { Template } from "meteor/templating";
import { Organizations } from "/imports/api/organizations.js";

import "./organizationSettings.html";

Template.organizationSettings.events({
    "submit #changesForm"(event){
        event.preventDefault();

        let form = event.target;

        if(form.name.value !== "" && form.website.value !== ""){
            Meteor.call("organization.update", form.name.value, form.website.value);
        }

        swal({
            title: "Success",
            text: "Successfully changed organization settings.",
            type: "success"
        });
    }
});

Template.organizationSettings.onRendered(() => {
    Meteor.setTimeout(() => {
        $("#name").val(Organizations.find({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}).fetch()[0].name);
        $("#website").val(Organizations.find({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}).fetch()[0].website);
    }, 0);
});