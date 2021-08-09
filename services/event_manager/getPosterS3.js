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

// Initializing AWS
const {
  AwsServiceClient,
  AwsRequest
} = require('mongodb-stitch-browser-services-aws');

// call env path
require('dotenv').config({ path: '../../.env' });

// Body-parser
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

// Default directory
app.use(express.static('../../views/events'));

// Mongo API key for authentication
const mongoAPIKey = process.env.MONGO_API_KEY;
const credential = new ServerApiKeyCredential(mongoAPIKey);

// Initilize client
const stitchClient = Stitch.initializeDefaultAppClient(process.env.STITCH_APP_NAME);

// MY_AWS_SERVICE is the name of the aws service you created in
// the stitch UI, and it is configured with a rule
// that allows the PutObject action on the s3 API
const aws = stitchClient.getServiceClient(AwsServiceClient.factory, process.env.MY_AWS_SERVICE);

function getPosterS3(fileName) {
  // These are the arguments specifically for the s3 service GetObject function
  const args = {
    Bucket: process.env.POSTER_BUCKET,
    Key: fileName
  };
  const request = new AwsRequest.Builder()
    .withService('s3')
    .withAction('GetObject')
    .withRegion('ap-south-1') // this is optional
    .withArgs(args); // depending on the service and action, this may be optional as well

  aws.execute(request.build())
    .then(async (result) => {
      // the shape of the result will depend on the AWS function being called
      console.log(result);
    }).catch(async (err) => {
      // handle failure
      console.log(err);
    });
}

app.post('/get_poster', async (req, res) => {
  var fileName = req.body.file_name;
  console.log(fileName);
  try {
    stitchClient.auth.loginWithCredential(credential).then(async (result) => {
      getPosterS3(fileName);
    });
  }
  catch (e) {
    console.error(e);
  }
  finally {
    // Close the connection to the MongoDB cluster
    // ALSO stitchApp.close() will return a promise
    await stitchClient.close();
  }
});

// Event listener
const port = process.env.PORT || 3000;
app.listen(port, () => console.info(`Listening in port ${port}`));
