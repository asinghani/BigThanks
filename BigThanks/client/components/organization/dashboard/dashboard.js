import { Template } from "meteor/templating";
import { Organizations } from "/imports/api/organizations.js";

import "./dashboard.html";

Template.organizationDashboard.events({
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

Template.organizationDashboard.helpers({
    "numRequests": () => {
        return Organizations.find({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}).fetch()[0].requests.length;
    }, "numRegistrations": () => {
        var num = 0;
        let opportunities = Organizations.find({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}).fetch()[0].opportunities;
        _.forEach(opportunities, (o) => {
            let registrations = o.registrations;
            _.forEach(registrations, (r) => {
                if(moment.unix(r.timestamp).add(1, "d").isAfter(moment())) {
                    num ++;
                }
            });
        });
        return num;
    }, "users": () => {
        let data = [];
        Organizations.find({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}).fetch()[0].users.forEach((userId) => {
            try{
                var user = ReactiveMethod.call("organization.user.get", userId, 0);
            } catch(e){
                console.err(e);
                return;
            }
            if(!user) return;

            var u = {
                id: userId,
                name: user.profile.name,
                email: user.emails[0].address
            };
            data.push(u);
        });
        return data;
    }, "requests": () => {
        let data = [];
        Organizations.find({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}).fetch()[0].requests.forEach((req) => {
            var r = {
                id: req._id,
                name: req.userName,
                opportunity: req.name
            };
            console.dir(r);
            data.push(r);
        });
        return data;
    }, "opportunities": () => {
        let data = [];
        Organizations.find({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}).fetch()[0].opportunities.forEach((opp) => {
            var o = {
                id: opp._id,
                name: opp.name,
                date: moment.unix(opp.startDate).format("MM/DD/YY")
            };
            if(!opp.deleted) data.push(o);
        });
        return data;
    }
});