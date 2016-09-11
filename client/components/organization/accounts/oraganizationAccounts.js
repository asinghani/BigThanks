import { Template } from "meteor/templating";
import { Organizations } from "/imports/api/organizations.js";
import { Mongo } from "meteor/mongo";

import "./organizationAccounts.html";

const validEmail = /.+@.+/;

var accountsDep = new Tracker.Dependency();
var renderId = 0;

Template.organizationAccounts.helpers({
    accountsTable: () => {
        accountsDep.depend();
        var f = [{
            label: "Name",
            key: "name"
        },{
            label: "Email Address",
            key: "email",
            fn: (email) => { return new Spacebars.SafeString(email.replace("@", "@<wbr>")); }
        }, {
            label: "Permission Level",
            key: "permission",
            sortable: false,
            fn: (permission, obj) => {
                let disable = (Roles.userIsInRole(obj._id, "organization_super_admin") || Meteor.userId() === obj._id) ? "disabled" : "";
                return new Spacebars.SafeString(`
                    <select class="permission-select" data-id="${obj._id}" class="form-control input-sm" ${disable}>
                        <option value="admin" ${permission === 4 ? "selected" : ""} >Admin</option>
                        <option value="opportunities_validate" ${permission === 3 ? "selected" : ""} >Edit Volunteer Opportunities & Validate Credits</option>
                        <option value="validate" ${permission === 2 ? "selected" : ""} >Validate Credits</option>
                        <option value="opportunities" ${permission === 1 ? "selected" : ""} >Edit Volunteer Opportunities</option>
                    </select>
                `);
            }
        }, {
            label: "",
            key: "_id",
            fn: (id, obj) => {
                let disable = (Roles.userIsInRole(obj._id, "organization_super_admin") || Meteor.userId() === obj._id) ? "disabled" : "";
                return new Spacebars.SafeString(`<a href="#" class="btn btn-primary btn-outline btn-xs btn-reset" data-id="${id}">Reset Password</a>
                        <a href="#" class="btn btn-danger btn-xs btn-delete" data-id="${id}" ${disable}>Delete Account</a>`);
            }
        }];

        let data = [];

        Organizations.find({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}).fetch()[0].users.forEach((userId) => {
            try{
                var user = ReactiveMethod.call("organization.user.get", userId, renderId);
            } catch(e){
                console.err(e);
                return;
            }
            if(!user) return;

            var permission = 0;
            if(Roles.userIsInRole(user, "organization_admin")) permission = 4;
            else if(Roles.userIsInRole(user, "organization_opportunities") && Roles.userIsInRole(user, "organization_validate")) permission = 3;
            else if(Roles.userIsInRole(user, "organization_validate")) permission = 2;
            else if(Roles.userIsInRole(user, "organization_opportunities")) permission = 1;

            if(permission == 0) return;

            var u = {
                name: user.profile.name,
                email: user.emails[0].address,
                permission: permission,
                _id: user._id
            };
            data.push(u);
        });

        return {
            collection: data,
            rowsPerPage: 10,
            showFilter: true,
            fields: f,
            rowClass: (obj) => {
                if(obj._id === Meteor.userId()){
                    return "success";
                } else if (obj._id === window.location.hash.substr(1)) {
                    return "flash-cell";
                } else {
                    return "default";
                }

            }
        };
    }
});

Template.organizationAccounts.events({
    "click .btn-reset"(event){
        event.preventDefault();
        Meteor.call("organization.user.resetPassword", $(event.target).attr("data-id"));
        swal("Password Reset", "An email has been sent to the user to reset their password", "success");
    }, "click .btn-delete"(event){
        event.preventDefault();
        swal({
            title: "Are you sure?",
            text: "This user will be permanently deleted",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Delete User",
            cancelButtonText: "Cancel",
            closeOnConfirm: true
        }, () => {
            Meteor.call("organization.user.delete", $(event.target).attr("data-id"), () => {
                Organizations.update({_id: new Mongo.ObjectID(Meteor.user().profile.organization)}, {$pull: {users: $(event.target).attr("data-id")} });
                Meteor.setTimeout(() => {
                    accountsDep.changed();
                    renderId++;
                }, 1000);
            });
        });
    }, "click #refresh"(event){
        event.preventDefault();
        accountsDep.changed();
        renderId++;

        let refresh = $("#refresh .fa");
        refresh.addClass("fa-spin");

        setTimeout(() => {
            refresh.removeClass("fa-spin");
        }, 2000);
    }, "change .permission-select"(event){
        let permission = $(event.target).val();
        let userId = $(event.target).attr("data-id");
        Meteor.call("organization.user.permission.set", userId, permission);
    }, "keyup #email"(event){
        if(validEmail.exec($("#email").val())){
            $("#emailGroup").removeClass("has-error").addClass("has-success");
            $("#feedbackIcon").removeClass("fa-times").addClass("fa-check");
            $(".add-btn").removeAttr("disabled");
        } else {
            $("#emailGroup").removeClass("has-success").addClass("has-error");
            $("#feedbackIcon").removeClass("fa-check").addClass("fa-times");
            $(".add-btn").attr("disabled", "true");
        }
    }, "click .add-btn"(event){
        Meteor.call("organization.user.add", $("#email").val(), () => {
            accountsDep.changed();
            renderId++;
            $("#email").val("");
        });
    }
});