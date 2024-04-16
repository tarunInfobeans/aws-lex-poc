const express = require('express');
const { LexRuntimeV2Client, GetSessionCommand } = require("@aws-sdk/client-lex-runtime-v2");

const app = express();

const client = new LexRuntimeV2Client({ region: "REGION" });

const params = {
  /** input parameters */
};
const command = new GetSessionCommand(params);

try {
  const data = await client.send(command);
  client.send(command).then(
    (data) => {
      // process data.
    },
    (error) => {
      // error handling.
    }
  );
  
  // process data.
} catch (error) {
  // error handling.
} finally {
  // finally.
}


app.listen(3000, () => {
  console.log("listening on 3000!!!");
});