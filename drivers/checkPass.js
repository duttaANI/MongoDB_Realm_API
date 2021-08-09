// Gives a StackTraceLimit function limit Error!!!

// Express
const express = require('express');

const app = express();

// JSON
app.use(express.json());

// Init Dotenv
require('dotenv').config({ path: '../.env' });

// Initializing stitch
const {
  Stitch
} = require('mongodb-stitch-server-sdk');

const client = Stitch.initializeDefaultAppClient(process.env.STITCH_APP_NAME);

// Body-parser
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: false
}));

// Bcrypt
const bcrypt = require('bcrypt');

// Default directory
app.use(express.static('../views/auth/'));

// Uses bcrypt.compare(<form_password>,<hashed_db_password>) to authenticate
// !!! Marked for deletion !!!
// async function cmpPass(pass, verify) {
//   try {
//     if (await bcrypt.compare(pass, verify)) {
//       return true;
//     }
//   }
//   catch (e) {
//     console.error(e);
//   }
//   return false;
// }

// POST request at '/check' to gather form info.
app.post('/check', async (req, res) => {
  const {
    email,
    pass
  } = req.body;
  // Uses function created at stich app, that returns document from collection.
  await client.callFunction('FindUserByEmail', [email]).then((result) => {
    if (result) {
      bcrypt.compare(pass, result.password).then((val) => {
        if (val) {
          console.info('Logged in!');
          return res.redirect('./welcome.html');
          // res.send('Success');
        }

        console.error('Wrong Password.');
        return res.redirect('./login.html');
        // res.send('WRONG!');
      }).catch(e => console.error(e));
    }
    else {
      res.redirect('./login.html');
      console.error('User does not exist.');
    }
  }).catch(e => console.error(e));
});

// Event listener
const port = process.env.PORT || 3000;
app.listen(port, () => console.info(`Listening in port ${port}`));
