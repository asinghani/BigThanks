Meteor.startup(function() {
  process.env.MAIL_URL = Meteor.settings.private.email.mail_url;
});