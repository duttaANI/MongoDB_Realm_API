/* eslint-disable linebreak-style */
// Express
const express = require('express');

const app = express();

// JSON
app.use(express.json());

// Initializing stitch
const {
  Stitch,
  RemoteMongoClient,
  ServerApiKeyCredential
} = require('mongodb-stitch-server-sdk');

// call env path
require('dotenv').config({ path: '../../.env' });

// Mongo API key for authentication
const mongoAPIKey = process.env.MONGO_API_KEY;
const credential = new ServerApiKeyCredential(mongoAPIKey);

// Initilize client
const stitchApp = Stitch.initializeDefaultAppClient(process.env.STITCH_APP_NAME);
const mongodb = stitchApp.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas');
const clubsCollection = mongodb.db(process.env.CLUBHUB_DB).collection(process.env.CLUBS_COLLECTION);

// Body-parser
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));


// Default directory
app.use(express.static('../../views/events'));

async function insertClub(newClub) {
  try {
    await clubsCollection.insertOne(newClub)
      .then(result => console.log(`Successfully inserted item with _id: ${result.insertedId}`))
      .catch(err => console.error(`Failed to insert item: ${err}`));
  }
  catch (e) {
    console.log(e);
  }
}

// POST request at '/event_push' to gather form info.
app.post('/create_club', async (req, res) => {
  var clubName = req.body.club_name;
  console.log(clubName);
  // new Date object
  const ts = Date.now();

  try {
    stitchApp.auth.loginWithCredential(credential).then(async (result) => {
      console.log(req.body.club_name);
      console.log(req.body.club_logo + ts);
      // create a document to insert club

      const newClub = {
        title: 'club',
        properties: {
          clubName: {
            bsonType: req.body.club_name
          },
          clubLogo: {
            bsonType: req.body.club_logo + ts
          }
        }
      };


      insertClub(newClub);
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
app.listen(port, () => console.log(`Listening in port ${port}`));
