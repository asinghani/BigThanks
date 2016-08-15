import { Template } from "meteor/templating";

import "./organizationNav.html";

Template.organizationNav.onRendered(() => {
    $("#side-menu").metisMenu();
    $("[data-toggle=\"tooltip\"]").tooltip();

    let resizeCallback = () => {
        var topOffset = $("nav").height();

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    };

    $(window).bind("resize", resizeCallback);
    $(".navbar-toggle").click(() => {
        setTimeout(resizeCallback, 360);
    });
    resizeCallback();
});

Template.organizationNav.helpers({
    isActiveRouteTrueFalse(regex){
        return ActiveRoute.name(new RegExp(regex));
    }
});