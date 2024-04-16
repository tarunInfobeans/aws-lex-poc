// init project
var express = require("express");
var bodyParser = require("body-parser");
//var axios = require("axios");
const {
  LexRuntimeV2Client,
  RecognizeTextCommand
} = require("@aws-sdk/client-lex-runtime-v2");
var app = express();
var url = String(process.env.HOSTNAME).split("-");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// This route processes GET requests to "/"`
app.get("/", function (req, res) {
  res.send(
    '<h1>Talkdesk</h1><p>Fulfilment service<br/><br /><i>curl -H "Content-Type: application/json" -X POST -d \'{"username":"test","data":"1234"}\' https://' +
      url[2] +
      ".sse.codesandbox.io/update<i></p>"
  );
  console.log("Received GET");
});

// A route for POST requests sent to `/update`
app.post("/update", function (req, res) {
  if (!req.body.username || !req.body.data) {
    //console.log("Received incomplete POST: " + JSON.stringify(req.body));
    return res.send({ status: "error", message: "missing parameter(s)" });
  } else {
    console.log("Received POST: " + JSON.stringify(req.body));
    return res.send(req.body);
  }
});

//const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");

app.post("/dialogflow-fullfillment", (request, response) => {
  dialogflowFullfillment(request, response);
});

// Listen on port 8080
var listener = app.listen(8080, function () {
  console.log("Listening on port:" + listener.address().port);
});

const dialogflowFullfillment = (request, response) => {
  console.log("checking before", request);
  const agent = new WebhookClient({ request, response });
  console.log("checking after", agent);
  // mapped to default welcome
  async function ProcessRequest(agent) {
    var userSaid = request.body.queryResult.queryText;
    console.log("User said:" + userSaid);

    const client = new LexRuntimeV2Client({
      region: "us-east-1",
      credentials: {
// add the credentials here
      }
    });

    const params = {
      botAliasId: "TSTALIASID",
      botId: "O83XUX3GPX",
      localeId: "en_US",
      sessionId: "va",
      text: userSaid
    };

    const command = new RecognizeTextCommand(params);

    var sSay = "";
    var sIntent = "";

    try {
      const data = await client.send(command);
      // process data...
      //console.log(JSON.stringify(data));
      sSay = data.messages[0].content;
      sIntent = data.interpretations[0].intent.name;
      console.log("To say: " + sSay);
      console.log("Intent:" + sIntent);
      agent.add(sSay);
      //check on escalation
      if (sIntent === "Escalate") {
        console.log("Escalate!");
        agent.setFollowupEvent("escalateEvent");
      }
    } catch (error) {
      // error handling.
      console.log("Error - " + error);
    } finally {
      // finally.
      console.log("Terminated");
    }


    
  }

  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", ProcessRequest);
  intentMap.set("Default Fallback Intent", ProcessRequest);
  agent.handleRequest(intentMap);
};
