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

// POST request at '/upload_poster2' to gather form info.
app.post('/get_poster', async (req, res) => {
  var fileName = req.body.file_name;
  console.log(fileName);
  try {
    stitchApp.auth.loginWithCredential(credential).then(async (result) => {
      // Uses function created at stich app
      await stitchApp.callFunction('s3GetObject', [fileName]).then(async (result1) => {
        if (result1) {
          console.log(result1);
        }
        else {
          res.redirect('./get_poster.html');
          console.log(result1);
        }
      });
      if (result) {
        console.log('API auth done');
      }
    });
  }
  catch (e) {
    console.error(e);
  }
  finally {
    // Close the connection to the MongoDB cluster
    // ALSO stitchApp.close() will return a promise
    console.log('connection closed');
    await stitchApp.close();
  }
});

// Event listener
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening in port ${port}`));
