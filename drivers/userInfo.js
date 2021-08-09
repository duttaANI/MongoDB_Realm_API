// Gives a StackTraceLimit function limit Error!!!. // TODO: Find the issue here?

// Initializing JOI
const JOI = require('@hapi/joi');

// Initializing stitch
const {
  Stitch,
  ServerApiKeyCredential
} = require('mongodb-stitch-server-sdk');

// Init dotenv
require('dotenv').config({ path: '../.env' });

const client = Stitch.initializeDefaultAppClient(process.env.STITCH_APP_NAME);
const mongoAPI = process.env.MONGO_API_KEY;
const credential = new ServerApiKeyCredential(mongoAPI);

// Initializing express
const express = require('express');

const app = express();

// Body-parser
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

// Bcrypt
const bcrypt = require('bcrypt');

// Default directory
app.use(express.static('../views/auth/'));

// POST request at '/user_push' to gather user details
app.post('/user_push', async (req, res) => {
  console.info('Trying to create a new user!');
  const schema = JOI.object({
    first_name: JOI.string().required(),
    last_name: JOI.string().required(),
    email: JOI.string().email().required(),
    password: JOI.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    con_pass: JOI.ref('password'),
    registration_id: JOI.number().min(100000000).max(999999999).required(),
    phone_number: JOI.string().pattern(new RegExp('^((\\+){0,1}91(\\s){0,1}(\\-){0,1}(\\s){0,1}){0,1}98(\\s){0,1}(\\-){0,1}(\\s){0,1}[1-9]{1}[0-9]{7}$')).required(),
    whatsapp_no: JOI.string().pattern(new RegExp('^([\+][0-9]{1,3}([ \.\-])?)?([\(]{1}[0-9]{3}[\)])?([0-9A-Z \.\-]{1,32})((x|ext|extension)?[0-9]{1,4}?)$')).required()
  });
  const { error } = schema.validate({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email_id,
    password: req.body.password,
    con_pass: req.body.con_password,
    registration_id: req.body.reg_id,
    phone_number: req.body.ph_no,
    whatsapp_no: req.body.whatsapp_no
  });
  if (error) {
    console.error(error.message);
    res.redirect('./user_detail.html');
  }
  else {
    await client.callFunction('FindUserByEmail', [req.body.email_id]).then(async (result) => {
      if (result) {
        console.error('User already exists!');
      }
      else {
        try {
          const salt = await bcrypt.genSalt();
          const hashedPass = await bcrypt.hash(req.body.password, salt);

          client.auth.loginWithCredential(credential).then(async () => {
            await client.callFunction('createNewUser', [{
              Name: `${req.body.first_name} ${req.body.last_name}`,
              email: req.body.email_id,
              password: hashedPass,
              registration_id: req.body.reg_id,
              phone_number: req.body.ph_no,
              whatsapp_no: req.body.whatsapp_no
            }]).then(() => {
              console.info('Pushed Successfully');
            }).catch(() => {
              console.error('Failed');
            });
          }).catch(e => console.error(e));
        }
        catch (e) {
          console.error(e);
        }
      }
      res.redirect('./user_detail.html');
    });
  }
});

// Event Listener
const port = process.env.PORT || 3000;
app.listen(port, () => console.info(`Listening in port ${port}`));
