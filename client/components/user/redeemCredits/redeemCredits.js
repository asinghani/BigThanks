import { Template } from "meteor/templating";
import { Items } from "/imports/api/items.js";

import "./redeemCredits.html";


Template.redeemCredits.helpers({
    items: () => {
        var items = [];
        var index = 0;

        Items.find({}, {sort: {cost: 1}}).forEach((item) => {
            item._id = item._id._str;
            if(item.cost > Meteor.user().profile.credits) item.disabled = "disabled";
            if (item.stock == 0) item.disabled = "disabled";
            item.index = index;
            index ++;
            items.push(item);
        });

        let data = _.map(_.groupBy(items, (item) => Math.floor( parseFloat(item.index)/3.0 )), (val) => { return {items: val}; });

        console.dir(data);

        return data;
    }
});

Template.redeemCredits.events({
    "click .btn-purchase"(event){
        event.preventDefault();

        let id = $(event.target).attr("data-id");
        let item = $(event.target).attr("data-item");
        let credits = $(event.target).attr("data-credits");

        swal({
            title: "Are you sure?",
            text: `Would you like to purchase ${item} for ${credits} credits?`,
            type: "info",
            showCancelButton: true,
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        }, () => {
            Meteor.call("purchase", id, (err) => {
                if(err){
                    console.error(err);
                    swal("Error", "An internal error has occurred. Please try again later.", "error");
                    return;
                }
                swal("Purchased", item+" has been purchased and an e-voucher will be sent to your email address.", "success");
            });
        });

    }
});

Template.onRendered(() => {

    /*if(this._prearendered) return;
    this._prearendered = true;
    Meteor.setTimeout(() => {

    }, 1000);
    console.log(this._prearendered)
    let rows = $(".purchase-item-row");
    _.each(rows, (row) => {
        let cols = $(row).children();
        let maxHeight = 200;
        _.each(cols, (col) => {
            if($(col).height() > maxHeight) maxHeight = $(col).height();
        });
        console.log(maxHeight);
        _.each(cols, (col) => {
            $(col).height(maxHeight+20);
            $(col).children().height(maxHeight);
        });
    });*/
});
