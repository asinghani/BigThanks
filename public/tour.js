/* eslint prefer-arrow-callback: "off" */

$(function (){

    if(Meteor.user().profile.firstLogin){
        $("nav ul li").addClass("disabled");
        $("nav ul li a").attr("href", "#");
    }

    var tour = new Tour({
        steps: [
            {
                element: "#welcomeLabel",
                title: "Welcome, "+Meteor.user().profile.name,
                content: "This is your dashboard. Here, you can see your past volunteer history, redeem your credits, and search for volunteer opportunities",
                path: "/user/dashboard",
                placement: "auto right"
            },

            {
                element: "#infoLabel",
                title: "Credits Details",
                content: "Here, you can see the number of hours you have volunteered and the amount of credits earned. " +
                "Just for signing up, you earned a 5 credit bonus. Earning more credits is easy by participating in volunteer jobs.",
                path: "/user/dashboard",
                placement: "auto right"
            },

            {
                element: "#historyTable",
                title: "Volunteer Jobs History",
                content: "This table shows a history of the volunteer jobs you have participated in, as well as the credits earned",
                path: "/user/dashboard",
                placement: "bottom"
            },

            {
                element: "#volunteerOpportunitiesBtn",
                title: "Volunteer Opportunities",
                content: "On the volunteer opportunities page, you can find volunteer opportunities to sign up for.",
                path: "/user/dashboard"
            },

            {
                element: ".volunteer-opportunity-table",
                title: "Volunteer Opportunities List",
                content: "This list shows all available volunteer opportunities. To sign up, contact the organizer using the email address they have provided.",
                path: "/volunteer-opportunities",
                placement: "auto top"
            },

            {
                element: "#map-group",
                title: "Volunteer Opportunities Map",
                content: "With this map, you can search for potential volunteer opportunities near you.",
                path: "/volunteer-opportunities",
                placement: "auto bottom"
            },

            {
                element: "#requestBtn",
                title: "Request Credit Validation",
                content: "After participating in a volunteer opportunity, " +
                "you can search for the volunteer opportunity that you participated in and enter the amount of time volunteered " +
                "to earn your credits.",
                path: "/volunteer-opportunities",
                placement: "auto bottom"
            },

            {
                element: "#request-form",
                title: "Credit Validation",
                content: "Simply select the organizer, the volunteer opportunity, and the amount of time volunteered",
                path: "/user/request-credits",
                placement: "auto right"
            },

            {
                element: "#submit",
                title: "Credit Validation",
                content: "After clicking submit, the validation request will be sent to the organizer. If the information is correct, " +
                "they will confirm the credits, and the credits will be added to your total. You will be notified the next time you log in. " +
                "All credits, even if still pending, are shown on your dashboard page in the history table.",
                path: "/user/request-credits",
                placement: "auto right"
            },

            {
                element: "#redeemBtn",
                title: "Redeem Credits",
                content: "On the redeem credits page, you can spend your credits to purchase items such as gift cards and vouchers.",
                path: "/user/request-credits",
                placement: "auto bottom"
            },

            {
                element: "#items",
                title: "Available Items",
                content: "Here, you can spend your credits to purchase items. After clicking purchase, " +
                "the credits will be deducted from your account and an e-voucher will be sent to your email address.",
                path: "/user/redeem-credits",
                placement: "auto top",
                onHide: function (){
                    Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.firstLogin": false}});
                }
            },

            {
                title: "Get started",
                content: "Thank you for signing up! You may now begin participating in volunteer jobs and earning credits.",
                path: "/user/dashboard",
                backdrop: true,
                orphan: true
            }

        ], onEnd: function (){
            Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.firstLogin": false}});
            BlazeLayout.render("layout", {
                content: "dashboard",
                nav: "userNav"
            });
        }
    });

    tour.init();

    $(document).ready(function (){
        if(window.location.pathname === "/user/dashboard" && Meteor.user().profile.firstLogin){
            tour.restart();
        }
    });

});