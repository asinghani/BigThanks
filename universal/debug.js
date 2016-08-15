export default () => {
    if(Meteor.isClient){
        Meteor.startup(() => {
            Meteor.setTimeout(() => {
                //Meteor.call("client.restarted");
            }, 500);
        });
    }

    if(Meteor.isServer){
        const exec = Npm.require("child_process").exec;
        Meteor.startup(() => {
            exec("if [ \"$(uname)\" == \"Darwin\" ]; then /usr/bin/osascript -e \"display notification \\\"Server Restarted\\\" with title \\\"Meteor\\\"\"; fi;");
            Meteor.methods({
                "client.restarted"() {
                    exec("if [ \"$(uname)\" == \"Darwin\" ]; then /usr/bin/osascript -e \"display notification \\\"Client Restarted\\\" with title \\\"Meteor\\\"\"; fi;");
                }
            });
        });
    }
};