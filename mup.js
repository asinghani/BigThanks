module.exports = {
    servers: {
        one: {
            host: "bigthanks.anishsinghani.com",
            username: "ubuntu",
            pem: "dev/BigThanks.pem"
        }
    },

    meteor: {
        name: "BigThanks",
        path: ".",
        servers: {
            one: {}
        },
        buildOptions: {
            serverOnly: true
        },
        env: {
            ROOT_URL: "https://bigthanks.anishsinghani.com",
            MONGO_URL: "mongodb://localhost:27017/BigThanks"
        },

        deployCheckWaitTime: 60
    }
};