import { Template } from 'meteor/templating';

import "./dashboard.html";


Template.accountSettings.onRendered(() => {
    $("#qr").qrcode({size: 300, text: Meteor.userId()});
});