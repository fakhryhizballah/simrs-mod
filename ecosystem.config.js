module.exports = {
    apps: [{
        name: "node-webservice",
        script: "./index.js",
        watch: true,
        env: {
            NODE_ENV: "development",
        }
    }]
}