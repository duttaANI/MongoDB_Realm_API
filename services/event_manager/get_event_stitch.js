/* eslint-disable linebreak-style */
// Express
const express = require('express');

const app = express();

// JSON
app.use(express.json());

// Initializing stitch
const {
  Stitch,
  ServerApiKeyCredential
} = require('mongodb-stitch-server-sdk');

// call env path
require('dotenv').config({ path: '../../.env' });

// Mongo API key for authentication
const mongoAPIKey = process.env.MONGO_API_KEY;
const credential = new ServerApiKeyCredential(mongoAPIKey);


// Initilize client
const stitchApp = Stitch.initializeDefaultAppClient(process.env.STITCH_APP_NAME);

// Body-parser
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

// Default directory
app.use(express.static('../../views/events'));

// POST request at '/get_event_info' to gather form info.
app.post('/get_event_info', async (req, res) => {
  var eventName = req.body.event_name;
  console.log(eventName);
  try {
    stitchApp.auth.loginWithCredential(credential).then(async (result) => {
      // Uses function created at stich app, that returns club_id from club_name in collection.
      await stitchApp.callFunction('stitch_Get_Event', [eventName]).then(async (result1) => {
        const result3 = JSON.stringify(result1);
        if (result1) {
          console.log(result3);
        }
        else {
          res.redirect('./get_event_info.html');
          console.log(result1);
          console.error('Club does not exist.');
        }
      });
      if (result) {
        console.log(result);
      }
    });
  }
  catch (e) {
    console.error(e);
  }
  finally {
    // Close the connection to the MongoDB cluster
    // ALSO stitchApp.close() will return a promise
    console.info('Connection closed.');
    await stitchApp.close();
  }
});

// Event listener
const port = process.env.PORT || 3000;
app.listen(port, () => console.info(`Listening in port ${port}`));
