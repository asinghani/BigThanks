export default (BrowserPolicy) => {
    BrowserPolicy.content.allowOriginForAll("*.googleapis.com");
    BrowserPolicy.content.allowOriginForAll("*.gstatic.com");
    BrowserPolicy.content.allowOriginForAll("*.bootstrapcdn.com");
    BrowserPolicy.content.allowOriginForAll("*.google.com");
    BrowserPolicy.content.allowOriginForAll("cdn.jsdelivr.net");
    BrowserPolicy.content.allowFontDataUrl();

    BrowserPolicy.content.disallowInlineScripts();
    BrowserPolicy.content.disallowConnect();

    let root = __meteor_runtime_config__.ROOT_URL;
    BrowserPolicy.content.allowConnectOrigin(root);
    BrowserPolicy.content.allowConnectOrigin(root.replace("http", "https"));
    BrowserPolicy.content.allowConnectOrigin(root.replace(/http(s?)/, "ws$1"));

    BrowserPolicy.content.allowConnectOrigin("http://bigthanks.dev");
    BrowserPolicy.content.allowConnectOrigin("https://bigthanks.dev");
    BrowserPolicy.content.allowConnectOrigin("ws://bigthanks.dev");
    BrowserPolicy.content.allowConnectOrigin("wss://bigthanks.dev");
    BrowserPolicy.content.allowConnectOrigin("https://enginex.kadira.io/simplentp/sync");
};

Meteor.startup(() => {
    Meteor.users.deny({
        update: function() {
            return true;
        }
    });

    if(Meteor.isDevelopment){
        SSL("./assets/app/bigthanks.dev.key", "./assets/app/bigthanks.dev.crt", 443);
    }
});
