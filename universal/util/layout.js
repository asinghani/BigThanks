export function getLayout() {
    if (!Meteor.userId()) {
        $("body").css("padding-top", "");
        return "layout";
    } else if (Roles.userIsInRole(Meteor.userId(), "organization", "Reserved")) {
        $("body").css("padding-top", 0);
        return "fullWidthLayout";
    } else {
        $("body").css("padding-top", "");
        return "layout";
    }
}

export function getNav() {
    if (!Meteor.userId()) {
        return "publicNav";
    } else if (Roles.userIsInRole(Meteor.userId(), "organization", "Reserved")) {
        return "organizationNav";
    } else {
        return "userNav";
    }
}