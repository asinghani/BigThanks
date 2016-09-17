import { Template } from "meteor/templating";

import "./dashboard.html";

Template.adminDashboard.events({
    "click #logout"(event){
        FlowRouter.go("/sign-out");
    }
});
