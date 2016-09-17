import { Template } from "meteor/templating";
import { Items } from "/imports/api/items.js";

import "./itemsPage.html";

var EditId = undefined;

var uploader = new Slingshot.Upload("itemUpload");

Template.itemsPage.helpers({
    itemsTable: () => {
        var f = [{
            label: "Name",
            key: "name"
        },{
            label: "Description",
            key: "desc"
        },{
            label: "Sponsor",
            key: "sponsor"
        },{
            label: "Cost",
            key: "cost",
            fn: (cost) => cost+" credits"
        },{
            label: "Website",
            key: "website",
            fn: (website) => {
                return new Spacebars.SafeString(`<a href="${website}" target="_blank">${_.escape(website)}</a>`);
            }
        },{
            label: "Stock",
            key: "stock"
        },{
            label: "Actions",
            key: "_id",
            fn: (id) => {
                return new Spacebars.SafeString(`<a href="#" type="button" class="btn btn-primary btn-xs edit-btn" data-id="${id._str}">
                        <i class="fa fa-pencil" data-id="${id._str}"></i>
                    </a>
                    <a href="#" type="button" class="btn btn-danger btn-xs delete-btn" data-id="${id._str}"><i class="fa fa-trash-o" data-id="${id._str}"></i></a>`);
            }
        }];

        return {
            collection: Items,
            rowsPerPage: 10,
            showFilter: true,
            fields: f
        };
    }
});
/*
*

 */

Template.itemsPage.events({
    "click #addBtn"(event) {
        $(".form-control").removeAttr("disabled").val("");
        $("#invalid-email").css("display", "none");
        $("#fill-all").css("display", "none");


        $("#imagePreview").attr("src", "").css("display", "none");

        $("#editModal").modal();
    }, "click .edit-btn"(event) {
        $(".form-control").removeAttr("disabled").val("");
        $("#fill-all").css("display", "none");

        let id = $(event.target).attr("data-id");

        EditId = id;

        console.log(event.target);
        console.log($(event.target));

        console.log(id);
        console.log(EditId);

        let item = Items.find({_id: new Mongo.ObjectID(id)}).fetch()[0];

        console.log(item);

        $("#name").val(item.name);
        $("#desc").val(item.desc);
        $("#sponsor").val(item.sponsor);
        $("#cost").val(parseInt(item.cost));
        $("#website").val(item.website);
        $("#instructions").val(item.instructions);

        $("#imagePreview").attr("src", item.image).css("display", "block");
        Session.set("imageUrl", item.image);

        $("#codes").val(item.codes.join("\n"));

        $("#editModal").modal();
    }, "change #imagePicker"(event){

        $(".save-btn").attr("disabled", "disabled").html("Uploading...");

        uploader.send(event.target.files[0], (err, url) => {
            $(".save-btn").removeAttr("disabled").html("Save");
            if (err) {
                swal("Error Occurred", "An error has occurred while trying to upload the image. Please try again later.", "error");
            } else {
                Session.set("imageUrl", url);
                $("#imagePreview").attr("src", url).css("display", "block");
            }
        });
        
    }, "click .delete-btn"(event) {
        swal({
            title: "Are you sure?",
            text: "This item will be deleted permanently.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            closeOnConfirm: true
        }, () => {
            Meteor.call("item.delete", $(event.target).attr("data-id"));
        });
    }, "click .save-btn"(event) {
        $("#fill-all").css("display", "none");

        if(EditId){

            let name = $("#name").val();
            let desc = $("#desc").val();
            let sponsor = $("#sponsor").val();
            let cost = parseInt($("#cost").val());
            let website = $("#website").val();
            let image = Session.get("imageUrl");
            let instructions = $("#instructions").val();

            let codes = $("#codes").val();

            if (!name || !desc || !sponsor || !cost || !website || !image || !instructions) {
                $("#fill-all").css("display", "block");
                return;
            }

            $(".form-control").attr("disabled", "disabled");

            Meteor.call("item.edit", EditId, name, desc, sponsor, cost, website, image, instructions, codes, (err) => {
                if(err){
                    console.error(err);
                    swal("Error Occurred", "An internal error occurred while completing this action. " +
                        "Please verify that all information is correct.", "error");
                    $("html, body").animate({scrollTop : 0}, 800);
                    $(".form-control").removeAttr("disabled");
                    return;
                }
                swal("Success", "Successfully edited the item.", "success");
                $(".form-control").removeAttr("disabled");
                $("#editModal").modal("hide");
                Session.set("imageUrl", undefined);
            });

        } else {
            let name = $("#name").val();
            let desc = $("#desc").val();
            let sponsor = $("#sponsor").val();
            let cost = parseInt($("#cost").val());
            let website = $("#website").val();
            let image = Session.get("imageUrl");
            let instructions = $("#instructions").val();

            let codes = $("#codes").val();

            if (!name || !desc || !sponsor || !cost || !website || !image || !instructions) {
                $("#fill-all").css("display", "block");
                return;
            }

            $(".form-control").attr("disabled", "disabled");

            Meteor.call("item.add", name, desc, sponsor, cost, website, image, instructions, codes, (err) => {
                if(err){
                    console.error(err);
                    swal("Error Occurred", "An internal error occurred while completing this action. " +
                        "Please verify that all information is correct and that this is not a repeated submission.", "error");
                    $(".form-control").removeAttr("disabled");
                    $("html, body").animate({scrollTop : 0}, 800);
                    return;
                }
                swal("Success", "Successfully added the item.", "success");
                $(".form-control").removeAttr("disabled");
                $("#editModal").modal("hide");
                Session.set("imageUrl", undefined);
            });
        }
    }, "change #image"(event) {
        $("#imagePreview").attr("src", $("#image").val());
    }
});