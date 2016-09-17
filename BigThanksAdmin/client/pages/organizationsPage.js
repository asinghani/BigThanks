import { Template } from "meteor/templating";
import { Organizations } from "/imports/collections.js";

import "./organizationsPage.html";

const validEmail = /.+@.+/;

Template.organizationsPage.helpers({
    organizationsTable: () => {
        var f = [{
            label: "Name",
            key: "name"
        },{
            label: "Website",
            key: "website",
            fn: (website) => {
                return new Spacebars.SafeString(`<a href="${website}" target="_blank">${_.escape(website)}</a>`);
            }
        },{
            label: "Volunteer Opportunities",
            key: "opportunities",
            fn: (opportunities) => {
                return opportunities.length;
            }
        },{
            label: "Users",
            key: "users",
            fn: (users) => {
                return users.length;
            }
        }];

        return {
            collection: Organizations,
            rowsPerPage: 10,
            showFilter: true,
            fields: f
        };
    }
});

Template.organizationsPage.events({
    "click #addBtn"(event) {
        $(".form-control").removeAttr("disabled");
        $("#invalid-email").css("display", "none");
        $("#fill-all").css("display", "none");

        $("#addModal").modal();
    }, "click .save-btn"(event) {
        $("#invalid-email").css("display", "none");
        $("#fill-all").css("display", "none");

        let organizationName = $("#organizationName").val();
        let website = $("#website").val();
        let adminName = $("#adminName").val();
        let email = $("#email").val();

        if (!organizationName || !website || !adminName || !email) {
            $("#fill-all").css("display", "block");
            return;
        }

        if (!validEmail.exec(email)) {
            $("#invalid-email").css("display", "block");
            return;
        }

        $(".form-control").attr("disabled", "disabled");

        Meteor.call("organization.add", organizationName, website, adminName, email, (err) => {
            if(err){
                console.error(err);
                swal("Error Occurred", "An internal error occurred while completing this action. " +
                    "Please confirm that all information is correct and that this is not a repeated submission.", "error");
                $(".form-control").removeAttr("disabled");
                return;
            }
            swal("Success", "Successfully added this organization.", "success");
            $(".form-control").removeAttr("disabled");
            $("#addModal").modal("hide");
        });
    }
});