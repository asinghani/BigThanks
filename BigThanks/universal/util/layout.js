export function getLayout() {
    if (!Meteor.userId()) {
        $("body").css("padding-top", "");
        return "layout";
    } else if (Roles.userIsInRole(Meteor.userId(), "organization")) {
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
    } else if (Roles.userIsInRole(Meteor.userId(), "organization")) {
        return "organizationNav";
    } else {
        return "userNav";
    }
}