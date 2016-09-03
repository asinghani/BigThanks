import { Template } from "meteor/templating";
import { Organizations } from "/imports/api/organizations.js";

import "./volunteerOpportunities.html";

var map;
var satelliteLayer;

Template.volunteerOpportunities.helpers({
    volunteerTable: () => {
        var f = [{
            label: "Date",
            key: "startDate",
            sortByValue: true,
            fn: (date, obj) => {
                if(parseInt(date) === parseInt(obj.endDate)) return moment.unix(parseInt(date)).format("MMM Do, YYYY");
                return moment.unix(parseInt(date)).format("MMM Do, YYYY")+" - "+moment.unix(parseInt(obj.endDate)).format("MMM Do, YYYY");
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
                return new Spacebars.SafeString(`<a href="mailto:${_.escape(contact)}">${Meteor.isCordova ? "Click here" : _.escape(contact).replace("@", "@<wbr>")}</a>`);
            }
        }];

        let data = [];

        Organizations.find().forEach((organization) => {
            let opportunities = JSON.parse(JSON.stringify(organization.opportunities));
            if (opportunities){
                opportunities.forEach((opportunity) => {
                    if(!opportunity.public) return;
                    if(opportunity.deleted) return;
                    if(moment.unix(opportunity.endDate).isBefore(moment())) return;
                    opportunity.organizer = organization._id;
                    data.push(opportunity);
                });
            }
        });

        Meteor.setTimeout(() => {
            renderMap(data);
        }, 0);

        return {
            collection: data,
            rowsPerPage: 10,
            showFilter: true,
            fields: f,
            noDataTmpl: Template.organizationTablePlaceholder
        };
    }
});

function renderMap(data){
    addressPicker();

    $("#opportunityMap").height($(document).height()*2/5);

    if(!map){
        map = L.map("opportunityMap").setView([37.7749, -122.4194], 13);

        satelliteLayer = new L.Google("hybrid");
        map.addLayer(satelliteLayer);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                map.setView([position.coords.latitude, position.coords.longitude], 13);
            });
        }
    }
}

function addressPicker(){
    $("#map").locationpicker({
        radius: 0,
        inputBinding: {
            locationNameInput: $("#locationSearch"),
            latitudeInput: $("#lat"),
            longitudeInput: $("#long")
        },
        enableAutocomplete: true,
        onchanged: (loc) => {
            let offset = map._getNewTopLeftPoint([loc.latitude, loc.longitude]).subtract(map._getTopLeftPoint());
            map.panBy(offset, {animate: true, duration: 1.5});
        }
    });
    Meteor.setTimeout(() => {
        $("#locationGroup").css("visibility", "visible");
        $("#locationSearch").val("");
    }, 1500);
}