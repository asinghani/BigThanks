import { Template } from "meteor/templating";

import "./home.html";

Template.home.events({
    "click #signUp"(event){
        FlowRouter.go("/sign-up");
    }
});

Template.home.onRendered(() => {

    let resizeCallback = () => {
        var topOffset = $("nav").height();

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#top-header").css("min-height", (height+70) + "px");
        }
    };

    $(window).bind("resize", resizeCallback);
    $(document).ready(() => { setTimeout(resizeCallback, 50); });

    $("a.page-scroll").bind("click", function(event) {
        var $anchor = $(this);
        $("body").animate({
            scrollTop: ($($anchor.attr("href")).offset().top - 50)
        }, 1250);
        event.preventDefault();
    });

    window.sr = ScrollReveal();
    sr.reveal(".sr-icons", {
        duration: 600,
        scale: 0.3,
        distance: "0px"
    }, 200);

    sr.reveal(".sr-icons-2", {
        duration: 300,
        scale: 0.3,
        distance: "0px"
    }, 200);

    sr.reveal(".sr-button", {
        duration: 1000,
        delay: 200
    });
});