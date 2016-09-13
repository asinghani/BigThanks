import { Template } from "meteor/templating";

Template.registerHelper("dataReady", () => {
    return FlowRouter.subsReady();
});