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
const eventsCollection = mongodb
  .db(process.env.CLUBHUB_DB)
  .collection(process.env.EVENTS_COLLECTION);

// Body-parser
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));


// Default directory
app.use(express.static('../../views/events'));

async function insertEvent(newEvent) {
  try {
    await eventsCollection.insertOne(newEvent)
      .then(result => console.info(`Successfully inserted item with _id: ${result.insertedId}`))
      .catch(err => console.error(`Failed to insert item: ${err}`));
  }
  catch (e) {
    console.error(e);
  }
}

// POST request at '/event_push' to gather form info.
app.post('/event_push', async (req, res) => {
  var clubName = req.body.club_name;
  // new Date object
  const ts = Date.now();

  try {
    stitchApp.auth.loginWithCredential(credential).then(async () => {
    // Uses function created at stich app, that returns club_id from club_name in collection.
      await stitchApp.callFunction('stitch_Find_Club_Id', [clubName]).then(async (result) => {
        if (result) {
          console.log(result._id);
          console.table([
            req.body.venue,
            req.body.start_time,
            req.body.end_time,
            req.body.date,
            req.body.msg,
            req.body.event_name
          ]);
          // create a document to insert event

          const newEvent = {
            title: 'event',
            properties: {
              message: {
                bsonType: req.body.msg
              },
              totRegistered: {
                bsonType: 6
              },
              venue: {
                bsonType: req.body.venue
              },
              posterKey: {
                bsonType: req.body.posterName + ts
              },
              clubId: {
                bsonType: result._id
              },
              date: {
                bsonType: req.body.date
              },
              name: {
                bsonType: req.body.event_name
              },
              paid: {
                bsonType: req.body.paid
              },
              registry: {
                bsonType: []
              },
              time: {
                bsonType: 'object',
                properties: {
                  endTime: {
                    bsonType: req.body.end_time
                  },
                  startTime: {
                    bsonType: req.body.start_time
                  }
                }
              }
            }
          };


          insertEvent(newEvent);
        }
        else {
          res.redirect('./create_event.html');
          console.error('Club does not exist.');
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
