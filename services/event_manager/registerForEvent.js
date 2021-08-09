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
  ServerApiKeyCredential,
  BSON
} = require('mongodb-stitch-server-sdk');

// call env path
require('dotenv').config({ path: '../../.env' });

// Mongo API key for authentication
const mongoAPIKey = process.env.MONGO_API_KEY;
const credential = new ServerApiKeyCredential(mongoAPIKey);

// Initilize client
const stitchApp = Stitch.initializeDefaultAppClient('clubhub-ulzhy');
const mongodb = stitchApp.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas');
const eventsCollection = mongodb.db('clubhub_data').collection('events');

// Body-parser
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));


// Default directory
app.use(express.static('../../views/events'));

// Update query
const query = { 'properties.name.bsonType': 'test event altered' };
const update = {
  $push: {
    'properties.tags.bsonType': 'new tag'
  }
};
const options = { upsert: true };

// Update function
async function updateEvent() {
  try {
    await eventsCollection.updateOne(query, update, options)
      .then((result) => {
        const { matchedCount, modifiedCount } = result;
        if (matchedCount && modifiedCount) {
          console.info('Successfully updated the item.');
        }
      })
      .catch(err => console.error(`Failed to update the item: ${err}`));
  }
  catch (e) {
    console.error(e);
  }
}


app.get('/update_event', async (req, res) => {
  var eventName = req.body.event_name;
  console.log(eventName);
  try {
    stitchApp.auth.loginWithCredential(credential).then(async (result) => {
      updateEvent();
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
