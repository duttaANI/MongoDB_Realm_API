/* eslint-disable linebreak-style */
// Express
const express = require('express');

const app = express();

// JSON
app.use(express.json());

// initialize Stitch
const {
  Stitch,
  RemoteMongoClient,
  ServerApiKeyCredential
} = require('mongodb-stitch-server-sdk');

const {
  AwsServiceClient,
  AwsRequest
} = require('mongodb-stitch-browser-services-aws');

// call env path
require('dotenv').config({ path: '../../.env' });

// Default directory
app.use(express.static('../../views/events'));

// Body-parser
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

// Mongo API key for authentication
const mongoAPIKey = process.env.MONGO_API_KEY;
const credential = new ServerApiKeyCredential(mongoAPIKey);

// Initilize client
const stitchClient = Stitch.initializeDefaultAppClient(process.env.STITCH_APP_NAME);

// MyAwsService is the name of the aws service you created in
// the stitch UI, and it is configured with a rule
// that allows the PutObject action on the s3 API
const aws = stitchClient.getServiceClient(AwsServiceClient.factory, 'S3');

function uploadPosterS3(fileName, Base64, MIME) {
  // These are the arguments specifically for the s3 service PutObject function
  const args = {
    ACL: 'public-read',
    Bucket: process.env.POSTER_BUCKET,
    ContentType: MIME,
    Key: fileName,
    Body: Base64
    // or Body could be a BSON object
  };

  const request = new AwsRequest.Builder()
    .withService('s3')
    .withAction('PutObject')
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

app.post('/upload_poster2', async (req, res) => {
  var fileName = req.body.file_name;
  var Base64 = req.body.base_64;
  var MIME = req.body.mime_type;
  console.log(fileName);
  try {
    stitchClient.auth.loginWithCredential(credential).then(async (result) => {
      uploadPosterS3(fileName, Base64, MIME);
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
app.listen(port, () => console.log(`Listening in port ${port}`));
