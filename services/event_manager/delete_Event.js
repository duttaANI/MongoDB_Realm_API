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

// Initilize client
const stitchApp = Stitch.initializeDefaultAppClient(process.env.STITCH_APP_NAME);

// Body-parser
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

// Mongo API key for authentication
const mongoAPIKey = process.env.MONGO_API_KEY;
const credential = new ServerApiKeyCredential(mongoAPIKey);


// Default directory
app.use(express.static('../../views/events'));

// POST request at '/delete_event' to gather form info.
app.post('/delete_event', async (req, res) => {
  var eventName = req.body.event_name;
  console.log(eventName);
  try {
    stitchApp.auth.loginWithCredential(credential).then(async (result) => {
      // Uses function created at stich app, that returns club_id from club_name in collection.
      await stitchApp.callFunction('stitch_Delete_Event', [eventName]).then(async (result1) => {
        if (!result1) {
          console.log(result);
          console.info('event deleted');
        }
        else {
          res.redirect('./delete_event.html');
          console.log(result1);
          console.info('event not deleted');
        }
      });
    });
  }
  catch (e) {
    console.error(e);
  }
  finally {
    // Close the connection to the MongoDB cluster
    // ALSO stitchApp.close() will return a promise
    await stitchApp.close();
  }
});

// Event listener
const port = process.env.PORT || 3000;
app.listen(port, () => console.info(`Listening in port ${port}`));
