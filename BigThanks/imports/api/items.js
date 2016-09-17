import { Mongo } from "meteor/mongo";

export const Items = new Mongo.Collection("items");

if(Meteor.isServer) {

    Meteor.methods({
        "purchase"(id){
            if (!Meteor.userId()) {
                throw new Meteor.Error("not-authorized");
            }

            if (!id) {
                throw new Meteor.Error("invalid-args");
            }

            let item = Items.find({_id: new Mongo.ObjectID(id)}).fetch()[0];
            let code = item.codes[0];

            if(!item || !code || item.stock === 0 || item.codes.length === 0){
                throw new Meteor.Error("invalid-action");
            }

            Items.update({ _id: new Mongo.ObjectID(id) }, {$pull: { codes: code }, $inc: { stock: -1 }});

            Meteor.users.update({ _id: Meteor.userId()}, {$inc: {
                "profile.credits": 0 - parseInt(item.cost)
            }});


            let url = generateBarcode(code);

            let emailMsg = SSR.render("voucher", {
                item: item.name,
                instructions: item.instructions,
                cost: item.cost,
                code: code,
                barcode: url,
                sponsor: item.sponsor,
                url: item.website
            });


            Email.send({
                from: Meteor.settings.private.email.no_reply,
                to: Meteor.user().emails[0].address,
                subject: "Big Thanks: E-voucher for your "+item.name,
                html: emailMsg
            });
        }, "item.add"(name, desc, sponsor, cost, website, image, instructions, codes) {
            if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "admin")) {
                throw new Meteor.Error("not-authorized");
            }

            if (!name || !desc || !sponsor || !cost || !website || !image || !instructions) {
                throw new Meteor.Error("invalid-args");
            }

            let codesArray = codes.split("\n");
            let stock = codesArray.length;

            Items.insert({
                _id: new Mongo.ObjectID(),
                name: name,
                desc: desc,
                sponsor: sponsor,
                cost: cost,
                website: website,
                image: image,
                instructions: instructions,
                codes: codesArray,
                stock: stock
            });
        }, "item.delete"(id) {
            Items.remove({_id : new Mongo.ObjectID(id)});
        }, "item.edit"(id, name, desc, sponsor, cost, website, image, instructions, codes) {
            if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), "admin")) {
                throw new Meteor.Error("not-authorized");
            }

            if (!id || !name || !desc || !sponsor || !cost || !website || !image || !instructions) {
                throw new Meteor.Error("invalid-args");
            }

            let codesArray = codes.split("\n");
            let stock = codesArray.length;

            Items.update({ _id: new Mongo.ObjectID(id) }, {$set: {
                name: name,
                desc: desc,
                sponsor: sponsor,
                cost: cost,
                website: website,
                image: image,
                instructions: instructions,
                codes: codesArray,
                stock: stock
            }});
        }
    });

    var AWS = Npm.require("aws-sdk");
    var barcodeGenerate = Npm.require("barcode");
    AWS.config.region = "us-west-2";

    var generateBarcode = function (code) {
        let barcode = barcodeGenerate("code39", {
            data: code+"",
            width: 350,
            height: 100
        });
        let getStream = Meteor.wrapAsync(barcode.getStream, barcode);
        let body = getStream();
        let s3 = new AWS.S3({params: {Bucket: "bigthanksassets", Key: code+".png"}});
        let upload = Meteor.wrapAsync(s3.upload, s3);
        try{
            return upload({Body: body, ACL: "public-read"}).Location;
        } catch (e) {
            return "";
        }
    };

    Meteor.publish("items", function () {
        if(this.userId){
            return Items.find({}, {instructions: 0, codes: 0});
        }
    });
}