import { Template } from "meteor/templating";
import { Organizations } from "/imports/api/organizations.js";

import "./organizationOpportunities.html";

Opportunities = [];
EditOpportunity = {};
EditOpportunityId = -1;

const validEmail = /.+@.+/;

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
                return new Spacebars.SafeString(`<a href="mailto:${_.escape(contact)}">${_.escape(contact).replace("@", "@<wbr>")}</a>`);
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
                if(opportunity.deleted) return;
                data.push(opportunity);
            });
        }

        return {
            collection: data,
            rowsPerPage: 10,
            showFilter: true,
            fields: f,
            noDataTmpl: Template.organizationTablePlaceholder,
            rowClass: (obj) => {
                console.log(obj._id + "  " + window.location.hash.substr(1));
                if(!obj.public) return "warning";
                if(obj._id === window.location.hash.substr(1)) return "flash-cell";
                return "default";
            }
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
                if(o._id === EditOpportunityId){
                    opportunity = o;
                }
            });
        }
        EditOpportunity = opportunity; // Assign global var

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

        // Email + Validation icons
        $("#email").val(opportunity.contact);

        // Duration picker
        $("#durationMinContainer").html("<input type=\"text\" class=\"form-control duration-picker\" id=\"durationMin\">");
        $("#durationMaxContainer").html("<input type=\"text\" class=\"form-control duration-picker\" id=\"durationMax\">");

        $("#durationMin").val(parseInt(opportunity.minLength)*60);
        $("#durationMax").val(parseInt(opportunity.maxLength)*60);

        $(".duration-picker").durationPicker({
            showHours: false,
            showSeconds: false
        });

        $("#location").val(opportunity.location);

        $("#map").locationpicker({
            location: {latitude: opportunity.lat, longitude: opportunity.long},
            radius: 0,
            inputBinding: {
                locationNameInput: $("#address"),
                latitudeInput: $("#lat"),
                longitudeInput: $("#long")
            },
            enableAutocomplete: true
        });

        $(`#publicity option[value=${opportunity.public}]`).prop("selected", true);

        $("#delete-btn").css("display", "initial");

        $("#fill-all").css("display", "none");
        $("#invalid-email").css("display", "none");

        $("#editModal").on("shown.bs.modal", () => {
            $("map").locationpicker("autosize");
        }).modal();


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
    }, "click #delete-btn"(event){
        event.preventDefault();
        swal({
            title: "Are you sure?",
            text: "This volunteer opportunity will be deleted permanently. " +
            "Also, people will not be able to request credits for this opportunity.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            closeOnConfirm: true
        }, () => {
            Meteor.call("opportunity.delete", EditOpportunityId);
            $("#editModal").modal("hide");
        });
    }, "click #add-btn"(event){
        event.preventDefault();

        EditOpportunityId = undefined;
        EditOpportunity = {}; // Assign global var

        $("#startDate")
            .val(moment().format("M/D/Y"))
            .datepicker({
                disableTouchKeyboard: true,
                startDate: moment("2016-01-01").toDate(),
                endDate: "+12m",
                todayHighlight: true
            });

        $("#endDate")
            .val(moment().add(1, "days").format("M/D/Y"))
            .datepicker({
                disableTouchKeyboard: true,
                startDate: moment("2016-01-01").toDate(),
                endDate: "+12m",
                todayHighlight: true
            });

        $("#name").val("");
        $("#desc").val("");

        // Email + Validation icons
        $("#email").val("");

        // Duration picker
        $("#durationMinContainer").html("<input type=\"text\" class=\"form-control duration-picker\" id=\"durationMin\">");
        $("#durationMaxContainer").html("<input type=\"text\" class=\"form-control duration-picker\" id=\"durationMax\">");

        $("#durationMin").val(3600);
        $("#durationMax").val(7200);

        $(".duration-picker").durationPicker({
            showDays: false,
            showSeconds: false
        });

        $("#location").val("");
        $("#address").val("");

        $("#map").locationpicker({
            radius: 0,
            inputBinding: {
                locationNameInput: $("#address"),
                latitudeInput: $("#lat"),
                longitudeInput: $("#long")
            },
            enableAutocomplete: true
        });

        $("#publicity option[value=true]").prop("selected", true);

        $("#delete-btn").css("display", "none");

        $("#fill-all").css("display", "none");
        $("#invalid-email").css("display", "none");

        $("#editModal").on("shown.bs.modal", () => {
            $("map").locationpicker("autosize");
        }).modal();

    }, "click .save-btn"(event){
        event.preventDefault();

        if(!validEmail.exec($("#email").val())){
            $("#fill-all").css("display", "none");
            $("#invalid-email").css("display", "block");
            $(".modal").animate({ scrollTop: 0 }, "slow");
            return;
        }
        
        let valid = $("#startDate").val() &&
                $("#endDate").val() &&
                $("#name").val() &&
                $("#desc").val() &&
                $("#email").val() &&
                $("#durationMin").val() &&
                $("#durationMax").val() &&
                $("#location").val() &&
                $("#lat").val() &&
                $("#long").val() &&
                $("#publicity").val();

        if(!valid){
            $("#fill-all").css("display", "block");
            $("#invalid-email").css("display", "none");
            $(".modal").animate({ scrollTop: 0 }, "slow");
            return;
        }

        swal({
            title: "Changes Saved",
            text: "Changes to the volunteer opportunity have been saved.",
            type: "success"
        }, () => {
            var opportunity;
            if(EditOpportunity){
                opportunity = EditOpportunity;
            } else {
                opportunity = {};
            }

            let dateA = moment($("#startDate").val()).unix();
            let dateB = moment($("#endDate").val()).unix();

            opportunity.startDate = Math.min(dateA, dateB);
            opportunity.endDate = Math.max(dateA, dateB);

            opportunity.name = $("#name").val();
            opportunity.description = $("#desc").val();

            opportunity.contact = $("#email").val();

            let lengthA = parseInt($("#durationMin").val())/60;
            let lengthB = parseInt($("#durationMax").val())/60;

            opportunity.minLength = Math.min(lengthA, lengthB);
            opportunity.maxLength = Math.max(lengthA, lengthB);

            opportunity.location = $("#location").val();
            opportunity.lat = parseFloat($("#lat").val());
            opportunity.long = parseFloat($("#long").val());

            opportunity.public = $("#publicity").val() == "true";

            if(EditOpportunityId){
                Meteor.call("opportunity.update",
                    EditOpportunityId, opportunity);
            } else {
                Meteor.call("opportunity.insert", opportunity);
            }


            $("#editModal").modal("hide");
        });
    }, "keyup #email"(event){
        if(validEmail.exec($("#email").val())){
            $("#emailGroup").removeClass("has-error").addClass("has-success");
            $("#feedbackIcon").removeClass("fa-times").addClass("fa-check");
        } else {
            $("#emailGroup").removeClass("has-success").addClass("has-error");
            $("#feedbackIcon").removeClass("fa-check").addClass("fa-times");
        }
    }
});

Template.organizationNav.onRendered(() => {
    $("[data-toggle=\"popover\"]").popover();
});