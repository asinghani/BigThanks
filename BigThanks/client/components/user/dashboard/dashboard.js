import { Template } from "meteor/templating";
import { Mongo } from "meteor/mongo";
import { Organizations } from "/imports/api/organizations.js";

import "./dashboard.html";
import "./historyTablePlaceholder.html";

const StatusTypes = ["<p class=\"text-default\">Pending</p>", "<p class=\"text-success bold\">Approved</p>", "<p class=\"text-danger bold\">Denied</p>"];

Template.dashboard.helpers({
    historyTable: () => {
        var f = [{
            label: "Date",
            key: "timestamp",
            sortByValue: true,
            fn: (timestamp) => {
                return moment.unix(timestamp).format("MMMM Do, YYYY");
            }
        },{
            label: "Volunteer Opportunity",
            key: "opportunity"
        }, {
            label: "Time Volunteered",
            key: "length",
            sortByValue: true,
            fn: (length) => {
                if(length === -1) return "N/A";

                if(length < 60){
                    return `${length} minutes`;
                } else if (length % 60 == 0){
                    return `${length/60.0} hours`;
                } else{
                    return `${Math.floor(length/60.0)} hours, ${length % 60} minutes`;
                }
            }
        },{
            label: "Credits Earned",
            key: "credits",
            sortByValue: true,
            fn: (credits) => { return `${credits} credits`; }
        },{
            label: "Organizer",
            key: "validator",
            fn: (validator) => {
                if(!validator) return "N/A";
                return Organizations.find({ _id: new Mongo.ObjectID(validator) }).fetch()[0].name;
            }
        },{
            label: "Status",
            key: "status",
            sortByValue: true,
            fn: (status, object) => {
                if(object.new){
                    Meteor.setTimeout(() => {
                        if(status == 1){
                            swal({
                                title: "Approved",
                                text: `Your credits have for volunteering at ${object.opportunity} on 
                                ${moment.unix(object.timestamp).format("MMMM Do, YYYY")} have been approved. 
                                ${object.credits} credits have been added to your account.`,
                                type: "success"
                            });
                        } else if(status == 2){
                            if(!object.comment){
                                swal({
                                    title: "Denied",
                                    text: `Your credits for volunteering at ${object.opportunity} on 
                                ${moment.unix(object.timestamp).format("MMMM Do, YYYY")} have been denied with no comment given.`,
                                    type: "error"
                                });
                            }else{
                                swal({
                                    title: "Denied",
                                    text: `Your credits for volunteering at ${object.opportunity} on 
                                ${moment.unix(object.timestamp).format("MMMM Do, YYYY")} have been denied with comment "${object.comment}".`,
                                    type: "error"
                                });
                            }
                        } else return;
                        Meteor.call("user.history.resetNew", object._id);
                    }, 0);
                }
                return new Spacebars.SafeString(StatusTypes[status]);
            }
        },{
            label: "Comment",
            key: "comment",
            fn: (comment) => {
                if(!comment) return "None";
                else return comment;
            }
        }];

        return {
            collection: Meteor.user().profile.history,
            rowsPerPage: 10000,
            showFilter: false,
            fields: f,
            noDataTmpl: Template.historyTablePlaceholder
        };
    }
});