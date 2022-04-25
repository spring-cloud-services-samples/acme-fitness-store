const express = require("express");
const {SecretClient} = require("@azure/keyvault-secrets");
const {DefaultAzureCredential} = require("@azure/identity");
const appInsights = require("applicationinsights");
const app = express();

if (process.env.KEYVAULT_URI) {
    console.log("Found Key Vault Connection Info, setting up connection to key vault")
    const credential = new DefaultAzureCredential();
    const url = process.env.KEYVAULT_URI;
    const client = new SecretClient(url, credential);

    const appInsightsKey = await client.getSecret("ApplicationInsights--ConnectionString");

    if (appInsightsKey) {
        console.log("Found application insights secret, setting up Application Insights")
        let appInsights = require("applicationinsights");
        appInsights.setup().start();
    }
}

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    console.log("APPLICATIONINSIGHTS_CONNECTION_STRING env variable detected, setting up Application Insights");
    let appInsights = require("applicationinsights");
    appInsights.setup().start();
} else {
    console.log("No APPLICATIONINSIGHTS_CONNECTION_STRING provided, skipping Application Insights connection");
}

app.use(express.static("public"));

app.listen(8080, () => {
    console.log("Server started on port 8080");
});