import { Template } from "meteor/templating";
import { Organizations } from "/imports/api/organizations.js";
import { Mongo } from "meteor/mongo";

import "./volunteerOpportunities.html";

Template.volunteerOpportunities.helpers({
    volunteerTable: () => {
        var f = [{
            label: "Date",
            key: "startDate",
            sortByValue: true,
            fn: (date, obj) => {
                return moment(parseInt(date)*1000).format("MMM Do, YYYY")+" - "+moment(parseInt(obj.endDate)*1000).format("MMM Do, YYYY");
            }
        },{
            label: "Title",
            key: "name",
            sortByValue: true
        },{
            label: "Description",
            key: "description"
        }, {
            label: "Length",
            key: "minLength",
            sortByValue: true,
            fn: (length, obj) => {
                var minLength, maxLength;
                if(length < 60){
                    minLength = `${length} minutes`;
                } else if (length % 60 == 0){
                    minLength = `${length/60.0} hours`;
                } else{
                    minLength = `${Math.floor(length/60.0)} hours, ${length % 60} minutes`;
                }

                var max = obj.maxLength;

                if(length < 60){
                    maxLength = `${max} minutes`;
                } else if (length % 60 == 0){
                    maxLength = `${max/60.0} hours`;
                } else{
                    maxLength = `${Math.floor(max/60.0)} hours, ${max % 60} minutes`;
                }

                return minLength+" - "+maxLength;
            }
        },{
            label: "Location",
            key: "location",
            sortByValue: true,
            fn: (location, obj) => {
                return new Spacebars.SafeString(`<a target="_blank" href="https://www.google.com/maps?z=10&t=h&q=loc:${_.escape(obj.lat)}+${_.escape(obj.long)}"> ${_.escape(location)} </a>`);
            }
        },{
            label: "Organizer",
            key: "organizer",
            sortByValue: true,
            fn: (organizer) => {
                let organization = Organizations.find({_id: organizer}).fetch()[0];
                return organization.name;
            }
        },{
            label: "Contact",
            key: "contact",
            fn: (contact) => {
                return new Spacebars.SafeString(`<a href="mailto:${_.escape(contact)}">${_.escape(contact)}</a>`);
            }
        }];

        let data = [];

        Organizations.find().forEach((organization) => {
            let opportunities = JSON.parse(JSON.stringify(organization.opportunities));
            if (opportunities){
                opportunities.forEach((opportunity) => {
                    opportunity._id = new Mongo.ObjectID();
                    opportunity.organizer = organization._id;
                    data.push(opportunity);
                });
            }
        });

        return {
            collection: data,
            rowsPerPage: 10,
            showFilter: true,
            fields: f,
            noDataTmpl: Template.organizationTablePlaceholder
        };
    }
});