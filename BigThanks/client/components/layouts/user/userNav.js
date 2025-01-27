import { Template } from "meteor/templating";

import "./userNav.html";

Template.userNav.events({
    "click #signUp"(event){
        FlowRouter.go("/sign-up");
    },
    "click #logout"(event){
        FlowRouter.go("/sign-out");
    },
    "click #helpBtn"(event){
        Meteor.call("user.tour.restart", () => {
            FlowRouter.go("/user/dashboard");

            let script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "/tour.js";
            document.body.appendChild(script);

        });
    }
});

Template.userNav.onRendered(() => {
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