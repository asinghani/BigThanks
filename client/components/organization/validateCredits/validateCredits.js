import { Template } from "meteor/templating";
import { Organizations } from "/imports/api/organizations.js";

import "./validateCredits.html";

Requests = [];

Template.validateCredits.helpers({
    requestsTable: () => {
        var f = [{
            label: "Date",
            key: "timestamp",
            sortByValue: true,
            fn: (timestamp) => {
                return moment.unix(parseInt(timestamp)).format("MMM Do, YYYY");
            }
        }, {
            label: "Volunteer Opportunity",
            key: "name",
            sortByValue: true
        }, {
            label: "Time Volunteered",
            key: "time",
            sortByValue: true,
            fn: (length) => {
                if (length < 60) {
                    return `${length} minutes`;
                } else if (length % 60 == 0) {
                    return `${length / 60.0} hours`;
                } else {
                    return `${Math.floor(length / 60.0)} hours, ${length % 60} minutes`;
                }
            }
        }, {
            label: "Name",
            key: "userName",
            sortByValue: true
        }, {
            label: "",
            key: "_id",
            fn: (id) => {
                return new Spacebars.SafeString(`<a href="#" type="button" class="btn btn-success btn-xs approve-btn" data-id="${id}">Approve</a>
                                                 <a href="#" type="button" class="btn btn-danger btn-xs deny-btn" data-id="${id}">Deny</a>`);
            }
        }];

        let data = [];

        let organization = Organizations.find({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}).fetch()[0];
        Requests = organization.requests;

        if (Requests) {
            Requests.forEach((req) => {
                data.push(req);
            });
        }

        return {
            collection: data,
            rowsPerPage: 10,
            showFilter: false,
            fields: f,
            noDataTmpl: Template.validateCreditsPlaceholder,
            rowClass: (req) => req._id === window.location.hash.substr(1) ? "flash-cell" : "default"
        };
    }
});

Template.validateCredits.events({
    "click .approve-btn"(event){
        event.preventDefault();
        let id = $(event.target).attr("data-id");

        var req;
        if(!Requests){
            swal("Internal Error",
                "An internal error occurred! Please try reloading the page", "error");
            return;
        }
        Requests.forEach((request) => {
            if(request._id === id){
                req = request;
            }
        });

        if(!req){
            swal("Internal Error",
                "An internal error occurred! Please try reloading the page", "error");
            return;
        }

        Meteor.call("request.confirm", req.userId, Meteor.user().profile.organization, req._id, 1, "", req.time);
    },"click .deny-btn"(event){
        event.preventDefault();
        let id = $(event.target).attr("data-id");

        var req;
        if(!Requests){
            swal("Internal Error",
                "An internal error occurred! Please try reloading the page", "error");
            return;
        }
        Requests.forEach((request) => {
            if(request._id === id){
                req = request;
            }
        });

        if(!req){
            swal("Internal Error",
                "An internal error occurred! Please try reloading the page", "error");
            return;
        }

        swal({
            title: "Deny request",
            text: "Comment (optional)",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: true,
            inputPlaceholder: "For example, you can write \"wrong organization\" or \"incorrect time\""
        }, (val) => {
            Meteor.call("request.confirm", req.userId, Meteor.user().profile.organization, req._id, 2, val, req.time);
        });

    }

});