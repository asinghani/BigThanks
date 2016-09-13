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

        let groupAmount = 1.0;
        let width = $(document).width();
        Session.get("sizeChanged");
        if(width >= 768) groupAmount = 2.0;
        if(width >= 992) groupAmount = 3.0;

        let data = _.map(_.groupBy(items, (item) => Math.floor( parseFloat(item.index)/groupAmount )), (val) => { return {items: val}; });

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

function getRows(selector) {
    var height = $(selector).height();
    var font_size = $(selector).css("font-size");
    var scale = 1.15;
    var line_height = Math.floor(parseInt(font_size) * scale);
    var rows = height / line_height;
    return Math.round(rows);
}

function trim(str){
    return str.trim().substring(0, str.trim().lastIndexOf(" "));
}

var resizeText = () => {

    let itemRows = $(".purchase-item-row");
    itemRows.each(function (index) {
        let cols = $(this).find(".col #desc");

        cols.each(function (index) {
            let rows = getRows(this);
            console.log(this.innerHTML);
            console.log(rows);
            console.log("----");

            if(rows < 2) this.innerHTML += "<br><br>";
            else if(rows < 3) this.innerHTML += "<br>";

            if(this.innerHTML.length > 70 && this.innerHTML.indexOf("More") == -1){
                let text = this.innerHTML;
                this.innerHTML = /.{70}.+?(?=\s)/.exec(text)[0];
                this.innerHTML += `&nbsp;<a data-toggle="tooltip" 
                    data-placement="top" title="${text}">More...</a>`;

                if(getRows(this) < 2) this.innerHTML += "<br><br>";
                else if(getRows(this) < 3) this.innerHTML += "<br>";
            }
        });
    });
    $("[data-toggle=\"tooltip\"]").tooltip({
        container: "body"
    });
};

Template.redeemCredits.onRendered(() => {
    $(window).resize(() => {
        Session.set("sizeChanged", $(window).width());
        resizeText();
    });

    /*let rows = $(".purchase-item-row");
    _.each(rows, (row) => {
        let cols = $(row).children();
        _.each(cols, (col) => {
            let desc = $(col).children("#desc");
            desc.css("color", "red");
            console.log(desc);
        });
    });*/
    Meteor.setTimeout(resizeText, 0);
});