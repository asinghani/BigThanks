import { Template } from "meteor/templating";
import { Organizations } from "/imports/api/organizations.js";

import "./volunteerOpportunities.html";

var map;
var satelliteLayer;
var opportunities;

var refreshMap = new Tracker.Dependency();
var markers = L.layerGroup();

Template.volunteerOpportunities.helpers({
    volunteerTable: () => {
        var f = [{
            label: "Date",
            key: "startDate",
            sortByValue: true,
            fn: getDate
        },{
            label: "Title",
            key: "name",
            sortByValue: true
        },{
            label: "Description",
            key: "description",
            fn: (desc, obj) => {
                if(desc.length <= 50) {
                    return desc;
                } else {
                    let text = /.{100}.+?(?=\s)/.exec(desc)[0];
                    return new Spacebars.SafeString(text + `... <a href="#" class="btn btn-link more-btn" data-index="${obj.index}">More</a>`);
                }
            }
        }, {
            label: "Length",
            key: "minLength",
            sortByValue: true,
            fn: getLength
        },{
            label: "Location",
            key: "location",
            sortByValue: true,
            fn: (location, obj) => {
                return new Spacebars.SafeString(`<a href="#" class="btn btn-link location-btn" data-lat="${_.escape(obj.lat)}" data-long="${_.escape(obj.long)}"> ${_.escape(location)} </a>`);
            }
        },{
            label: "Organizer",
            key: "organizer",
            fn: (organizer) => {
                let organization = Organizations.find({_id: organizer}).fetch()[0];
                return organization.name;
            }
        },{
            label: "Register",
            key: "_id",
            fn: (id, obj) => {
                return new Spacebars.SafeString(`<a href="#" class="btn btn-link register-btn" data-id="${id}" data-name="${obj.name}" data-organizer="${obj.organizer}">Register Now</a>`);
            }
        }];

        let data = [];
        let index = 0;

        Organizations.find().forEach((organization) => {
            let opportunities = JSON.parse(JSON.stringify(organization.opportunities));
            if (opportunities){
                opportunities.forEach((opportunity) => {
                    if(!opportunity.public) return;
                    if(opportunity.deleted) return;
                    if(moment.unix(opportunity.endDate).isBefore(moment())) return;
                    opportunity.organizer = organization._id;
                    opportunity.index = index;
                    data.push(opportunity);
                    index++;
                });
            }
        });
        opportunities = data;

        refreshMap.depend();

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

Template.volunteerOpportunities.events({
    "click .more-btn"(event){
        event.preventDefault();
        if(opportunities){
            let opp = opportunities[parseInt($(event.target).attr("data-index"))];
            $("#modal_title").html(opp.name);
            $("#modal_date").html(getDate(opp.startDate, opp));
            $("#modal_desc").html(opp.description);
            $("#modal_length").html(getLength(opp.minLength, opp));
            $("#modal_location").html(`<a target="_blank" href="https://www.google.com/maps?z=10&t=h&q=loc:${_.escape(opp.lat)}+${_.escape(opp.long)}"> ${_.escape(opp.location)} (Click to get directions) </a>`);
            $("#modal_organizer").html(Organizations.find({_id: opp.organizer}).fetch()[0].name);
            $("#modal_contact").html(`
                <a href="#" class="btn btn-link register-btn" data-id="${opp._id}" data-name="${opp.name}" data-organizer="${opp.organizer}">Register Now</a>`);
            $("#detailModal").modal("show");
        }
    }, "click .location-btn"(event){
        event.preventDefault();
        let coords = $(event.target);
        let lat = parseFloat(coords.attr("data-lat"));
        let long = parseFloat(coords.attr("data-long"));
        if(map){
            /*let offset = map._getNewTopLeftPoint([lat, long]).subtract(map._getTopLeftPoint());
            map.panBy(offset, {animate: true, duration: 1.5});
            setTimeout(() => {
            }, 1500);*/


            markers.eachLayer((layer) => {
                if(layer.getLatLng().lat === lat && layer.getLatLng().lng === long){
                    layer.openPopup();
                    $("html,body").animate({ scrollTop: 0 }, "slow");
                }
            });
        }
    }, "click .register-btn"(event){
        event.preventDefault();
        let link = $(event.target);
        let organization = link.attr("data-organizer");
        let id = link.attr("data-id");
        let name = link.attr("data-name");

        swal({
            title: "Are you sure?",
            text: `Would you like to sign up for ${name}?`,
            type: "info",
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, () => {
            Meteor.call("opportunity.register", organization, id, (err) => {
                if(err){
                    console.error(err);
                    swal("Error", "An internal error has occurred. Please try again later.", "error");
                    return;
                }
                swal("Signed Up", "You have successfully registered for this volunteer opportunity. " +
                    "You will receive further instructions in an email.", "success");
            });
        });
    }
});


function getDate(date, obj) {
    if(parseInt(date) === parseInt(obj.endDate)) return moment.unix(parseInt(date)).format("MMM Do, YYYY");
    return moment.unix(parseInt(date)).format("MMM Do, YYYY")+" - "+moment.unix(parseInt(obj.endDate)).format("MMM Do, YYYY");
}

function getLength(length, obj) {
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

Template.volunteerOpportunities.onRendered(() => {
    map = undefined;
    refreshMap.changed();
});

function renderMap(data){
    addressPicker();

    $("#opportunityMap").height(window.innerHeight*2/5);

    if(!map){
        L.Icon.Default.imagePath = "/images/map/markers";
        map = L.map("opportunityMap").setView([37.7749, -122.4194], 13);

        satelliteLayer = new L.Google("hybrid");
        map.addLayer(satelliteLayer);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                map.setView([position.coords.latitude, position.coords.longitude], 14);
            });
        }
    }
    markers.clearLayers();
    _.forEach(data, (opportunity) => {
        console.log([opportunity.lat, opportunity.long]);

        let popup = `
            <h5>${opportunity.name}</h5>
            <hr>
            <b>Date: </b>${getDate(opportunity.startDate, opportunity)}
            <br>
            <b>Organizer: </b>${Organizations.find({_id: opportunity.organizer}).fetch()[0].name}
            <br>
            <a href="#" class="btn btn-link more-btn" data-index="${opportunity.index}">More Info</a>
            <a href="https://www.google.com/maps?z=10&t=h&q=loc:${_.escape(opportunity.lat)}+${_.escape(opportunity.long)}"
             class="btn btn-link" target="_blank">Get Directions</a>
        `;

        let marker = L.marker([opportunity.lat, opportunity.long]);
        marker.bindPopup(popup, {autoPan: true});
        markers.addLayer(marker);
    });
    markers.addTo(map);
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