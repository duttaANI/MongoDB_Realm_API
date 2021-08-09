/* eslint-disable linebreak-style */
// Express
const express = require('express');

const app = express();

// require ObjectId
const { ObjectId } = require('mongodb');

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
const stitchApp = Stitch.initializeDefaultAppClient(process.env.STITCH_APP_NAME);
const mongodb = stitchApp.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas');
const eventsCollection = mongodb.db(process.env.CLUBHUB_DB).collection(process.env.EVENTS_COLLECTION);

// Body-parser
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));


// Default directory
app.use(express.static('../../views/events'));

// Register function
async function regEvent(eventName, userId) {
  // Update query
  const options = { upsert: true };
  const query = { 'properties.name.bsonType': eventName };
  const update = {
    $push: {
      'properties.registry.bsonType': ObjectId(userId)
    },
    $inc: {
      'properties.totRegistered.bsonType': 1
    }
  };

  try {
    await eventsCollection.findOne({ 'properties.name.bsonType': eventName })
      .then((event) => {
        // checking if user has already registered or not
        const found = event.properties.registry.bsonType.find(element => element.toString() === userId);

        // update event only if user hasn't already registered
        if (!found) return eventsCollection.updateOne(query, update, options);
        return null;
      })
      .then((result) => {
        if (result) {
          const { matchedCount, modifiedCount } = result;
          if (matchedCount && modifiedCount) {
            console.info('Successfully updated the event.');
          }
        }
        else console.log('You have already registered. Not updating the event.');
      })
      .catch(err => console.error(`Failed to update the item: ${err}`));
  }
  catch (e) {
    console.error(e);
  }
}


app.post('/register_event', async (req, res) => {
  var eventName = req.body.event_name;
  var userId = req.body.user_id;
  console.log(eventName);
  try {
    stitchApp.auth.loginWithCredential(credential).then(async (result) => {
      regEvent(eventName, userId);
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

// Export regEvent to make it available outside
module.exports.regEvent = regEvent;

// Event listener
// const port = process.env.PORT || 3000;
// app.listen(port, () => console.info(`Listening in port ${port}`));
