const bucket = "bigthanksuploads";
const url = "https://bigthanksuploads.s3.amazonaws.com/";

Slingshot.createDirective("itemUpload", Slingshot.S3Storage, {
    bucket: bucket,

    acl: "public-read",

    authorize: () => {
        if (!Meteor.userId() || !Roles.userIsInRole(Meteor.user(), "admin")) {
            throw new Meteor.Error("not-authorized");
        }
        return true;
    },
    allowedFileTypes: ["image/png", "image/jpeg", "image/gif"],
    maxSize: 4 * 1024 * 1024,
    key: () => {
        return "item_" + new Mongo.ObjectID()._str;
    },
    region: "us-west-1"
});