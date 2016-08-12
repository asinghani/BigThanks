import { Template } from 'meteor/templating';

import "./dashboard.html";
import "./historyTablePlaceholder.html";

const StatusTypes = ["<p class=\"text-primary\">Pending</p>", "<p class=\"text-success bold\">Approved</p>", "<p class=\"text-danger bold\">Denied</p>"];

Template.dashboard.helpers({
    historyTable: () => {
        var f = [{
            label: "Date",
            key: "timestamp",
            sortByValue: true,
            fn: (timestamp) => {
                return moment(timestamp).format("MMMM Do, YYYY");
            }
        },{
            label: "Volunteer Opportunity Description",
            key: "description"
        }, {
            label: "Time Volunteered",
            key: "length",
            sortByValue: true,
            fn: (length) => {
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
            label: "Validated By",
            key: "validator",
            fn: (validator) => { return "?? Placeholder"; }
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
                                text: `Your credits have for volunteering at ${object.description} on 
                                ${moment(object.timestamp).format("MMMM Do, YYYY")} have been approved. 
                                ${object.credits} credits have been added to your account.`,
                                type: "success"
                            });
                        } else if(status == 2){
                            swal({
                                title: "Denied",
                                text: `Your credits for volunteering at ${object.description} on 
                                ${moment(object.timestamp).format("MMMM Do, YYYY")} have been denied with comment "${object.comment}".`,
                                type: "error"
                            });
                        } else return;
                        Meteor.call("user.history.resetNew", object.timestamp);
                    }, 0);
                }
                return new Spacebars.SafeString(StatusTypes[status]);
            }
        },{
            label: "Comment",
            key: "comment"
        }];

        return {
            collection: Meteor.user().profile.history,
            rowsPerPage: 10,
            showFilter: false,
            fields: f,
            noDataTmpl: Template.historyTablePlaceholder
        };
    }
});