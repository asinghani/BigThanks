import { Template } from "meteor/templating";
import { Organizations } from "/imports/api/organizations.js";

import "./organizationOpportunities.html";

Opportunities = [];
EditOpportunityId = -1;

Template.organizationOpportunities.helpers({
    volunteerTable: () => {
        var f = [{
            label: "Date",
            key: "startDate",
            sortByValue: true,
            fn: (date, obj) => {
                if(parseInt(date) === parseInt(obj.endDate)) return moment.unix(parseInt(date)).format("MMM Do, YYYY");
                return moment(parseInt(date) * 1000).format("MMM Do, YYYY") + " - " + moment(parseInt(obj.endDate) * 1000).format("MMM Do, YYYY");
            }
        }, {
            label: "Title",
            key: "name",
            sortByValue: true
        }, {
            label: "Description",
            key: "description"
        }, {
            label: "Length",
            key: "minLength",
            sortByValue: true,
            fn: (length, obj) => {
                var minLength, maxLength;
                if (length < 60) {
                    minLength = `${length} minutes`;
                } else if (length % 60 == 0) {
                    minLength = `${length / 60.0} hours`;
                } else {
                    minLength = `${Math.floor(length / 60.0)} hours, ${length % 60} minutes`;
                }

                var max = obj.maxLength;

                if (length < 60) {
                    maxLength = `${max} minutes`;
                } else if (length % 60 == 0) {
                    maxLength = `${max / 60.0} hours`;
                } else {
                    maxLength = `${Math.floor(max / 60.0)} hours, ${max % 60} minutes`;
                }

                return minLength + " - " + maxLength;
            }
        }, {
            label: "Location",
            key: "location",
            sortByValue: true,
            fn: (location, obj) => {
                return new Spacebars.SafeString(`<a target="_blank" href="https://www.google.com/maps?z=10&t=h&q=loc:${_.escape(obj.lat)}+${_.escape(obj.long)}"> ${_.escape(location)} </a>`);
            }
        }, {
            label: "Contact",
            key: "contact",
            fn: (contact) => {
                return new Spacebars.SafeString(`<a href="mailto:${_.escape(contact)}">${_.escape(contact)}</a>`);
            }
        }, {
            label: "Public",
            key: "public",
            fn: (pub) => {
                return pub ? "Yes" : "No";
            }
        }, {
            label: "",
            key: "_id",
            fn: (id) => {
                return new Spacebars.SafeString(`<a href="#" type="button" class="btn btn-primary btn-xs edit-btn" data-id="${id}">Edit</a>`);
            }
        }];

        let data = [];

        let organization = Organizations.find({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}).fetch()[0];
        Opportunities = organization.opportunities;
        console.dir(Opportunities);
        if (Opportunities) {
            Opportunities.forEach((opportunity) => {
                data.push(opportunity);
            });
        }

        return {
            collection: data,
            rowsPerPage: 10,
            showFilter: true,
            fields: f,
            noDataTmpl: Template.organizationTablePlaceholder,
            rowClass: (obj) => obj.public ? "default" : "warning"
        };
    }
});

Template.organizationOpportunities.events({
    "click .edit-btn"(event){
        event.preventDefault();
        EditOpportunityId = $(event.target).attr("data-id");
        var opportunity;
        if (Opportunities) {
            Opportunities.forEach((o) => {
                if(o._id._str === EditOpportunityId){
                    opportunity = o;
                }
            });
        }

        if(!opportunity){
            swal("Internal Error",
                "An internal error occurred while trying to edit this opportunity. Please try reloading the page", "error");
            return;
        }

        $("#startDate")
            .val(moment.unix(opportunity.startDate).format("M/D/Y"))
            .datepicker({
                disableTouchKeyboard: true,
                startDate: moment("2016-01-01").toDate(),
                endDate: "+12m",
                todayHighlight: true
            });

        $("#endDate")
            .val(moment.unix(opportunity.endDate).format("M/D/Y"))
            .datepicker({
                disableTouchKeyboard: true,
                startDate: moment("2016-01-01").toDate(),
                endDate: "+12m",
                todayHighlight: true
            });

        $("#name").val(opportunity.name);
        $("#desc").val(opportunity.description);

        $("#editModal").modal();


    }, "click .close-btn"(event){
        event.preventDefault();
        swal({
            title: "Close dialog?",
            text: "All changes will be deleted",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, reverse changes",
            cancelButtonText: "No, continue editing",
            closeOnConfirm: true
        }, () => {
            $("#editModal").modal("hide");
        });
    }, "click .save-btn"(event){
        event.preventDefault();
        swal({
            title: "Changes Saved",
            text: "Changes to the volunteer opportunity have been saved.",
            type: "success"
        }, () => {
            $("#editModal").modal("hide");
        });
    }
});