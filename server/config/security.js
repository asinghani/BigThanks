export default (BrowserPolicy) => {
    BrowserPolicy.content.allowOriginForAll("*.googleapis.com");
    BrowserPolicy.content.allowOriginForAll("*.gstatic.com");
    BrowserPolicy.content.allowOriginForAll("*.bootstrapcdn.com");
    BrowserPolicy.content.allowOriginForAll("*.google.com");
    BrowserPolicy.content.allowOriginForAll("cdn.jsdelivr.net");
    BrowserPolicy.content.allowFontDataUrl();
};

Meteor.startup(() => {
    if(Meteor.isDevelopment){
        SSL("./assets/app/bigthanks.dev.key", "./assets/app/bigthanks.dev.crt", 443);
    }
});
