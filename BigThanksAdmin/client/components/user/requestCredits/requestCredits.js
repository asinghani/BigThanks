import { Template } from "meteor/templating";
import { Organizations } from "/imports/api/organizations.js";
import { Mongo } from "meteor/mongo";
import { Tracker } from "meteor/tracker";

import "./requestCredits.html";

var organizationDep = new Tracker.Dependency();
var opportunities = [];

Template.requestCredits.helpers({
    organizations: () => {
        var organizations = [];

        Organizations.find().forEach((organization) => {
            let o = {};

            o.id = organization._id._str;
            o.name = organization.name;

            if(Organizations.find({_id: new Mongo.ObjectID(o.id), "opportunities.deleted": false}).fetch().length == 0){
                o.disabled = true;
                o.noOpportunities = " (No volunteer opportunities)";
            }

            organizations.push(o);
        });

        setTimeout(() => {
            organizationDep.changed();
            $("#volunteerDuration").val(600);

            $(".duration-picker").durationPicker({
                showDays: false,
                showSeconds: false
            });
        }, 500);



        return organizations;
    }, opportunities: () => {
        organizationDep.depend();

        opportunities = [];

        let id = $("#organizationSelect").val();

        if(!id) return [];

        let organization = Organizations.find({ _id: new Mongo.ObjectID(id) }).fetch()[0];

        organization.opportunities.forEach((opportunity) => {
            if(!opportunity.public) return;
            if(opportunity.deleted) return;

            var o = {};
            o.id = opportunity._id;
            o.name = opportunity.name;
            o.date = moment.unix(opportunity.startDate).format("M/D/Y") + " - " + moment.unix(opportunity.endDate).format("M/D/Y");

            opportunities.push(o);
        });

        return opportunities;
    }
});

Template.requestCredits.events({
    "change #organizationSelect"(event){
        organizationDep.changed();
    }, "click #submit"(event){
        event.preventDefault();

        let organizationId = $("#organizationSelect").val();
        let opportunityId = $("#opportunitySelect").val();
        let time = parseInt($("#volunteerDuration").val())/60;

        var opportunityName;

        opportunities.forEach((opportunity) => {
            if(opportunity.id === opportunityId){
                opportunityName = opportunity.name;
            }
        });

        if(!opportunityName) {
            swal("Internal Error",
                "An internal error occurred. Reload the page or try again later.", "error");
            return;
        }

        Meteor.call("request.send", opportunityName, time, organizationId);

        swal("Submitted",
            "Credit validation request has been successfully submitted. Most organizations will approve credits within 2-4 business days of submitting.", "success");
    }
});