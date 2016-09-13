import { Template } from "meteor/templating";

import "./publicNav.html";

Template.publicNav.events({
    "click #signUp"(event){
        FlowRouter.go("/sign-up");
    },
    "click #logout"(event){
        FlowRouter.go("/sign-out");
    }
});

Template.publicNav.onRendered(() => {
    $("a.page-scroll").bind("click", function(event) {
        var $anchor = $(this);
        $("body").animate({
            scrollTop: ($($anchor.attr("href")).offset().top - 50)
        }, 1250);
        event.preventDefault();
    });

    $(".navbar-collapse ul li a").click(() => {
        $(".navbar-toggle:visible").click();
    });

    $("#mainNav").affix({
        offset: {
            top: 5
        }
    });
});