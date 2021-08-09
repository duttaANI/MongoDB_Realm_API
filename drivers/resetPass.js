// protoype
// with basic HTML pages for testing and no emailing, but shows link generation

const { ObjectID } = require('mongodb');
const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });

// Initializing Stitch
const {
  Stitch,
  ServerApiKeyCredential
} = require('mongodb-stitch-server-sdk');

const client = Stitch.initializeDefaultAppClient(process.env.STITCH_APP_NAME);
const authentication = client.auth.loginWithCredential(
  new ServerApiKeyCredential(process.env.MONGO_API_KEY)
);

// hooking Express middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('../views/auth/'));

/*
using the email and _id of the user, a JWT is made and this serves as the token.
a string of the hashed password + user's creation date is used as secret.
this ensures that tokens can be used only once.
this token is attached to the URL.
*/

/*
this first GET endpoint is only for testing.
won't make a difference if you remove later.
currently only being used to test via html pages, getting email address as input.
will be replaced by app/web layout later, and this endpoint won't be called at all.
*/
app.get('/resetpass', (req, res) => {
  res.redirect('./reset.html');
});


// this endpoint looks up for the user and displays generated reset link
app.post('/resetpass', (req, res, next) => {
  if (req.body.email) {
    const payload = {};
    authentication
      .then(() => client.callFunction('FindUserByEmail', [req.body.email]))
      .then((user) => {
        payload.email = user.email;
        payload.id = user._id;
        const secret = user.password + user._id.getTimestamp().toString();
        const token = jwt.encode(payload, secret);
        const link = process.env.RESET_LINK;

        // setting up mailing
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'testingrandom852@gmail.com', // TODO: Push this to env vars if used.
            pass: process.env.EMAIL_PWD
          }
        });

        const mail = {
          from: 'Clubhub <testingrandom852@gmail.com>',
          to: user.email,
          subject: 'Clubhub: Password Reset',
          text: 'Clubhub: Password Reset',
          html: `<h4>Password Reset Link</h4><a href="http://${link}/${payload.id}/${token}">Here is the link</a>`
          // insert actual link here during production push
        };

        transporter.sendMail(mail, (err) => {
          if (err) res.end('email wasn\'t sent, try again');
          else res.end(`email sent to ${user.email}`);
        });
      })
      .catch(err => next(err));
  }
  else res.send('Email address not sent in request');
});

/*
this endpoint is accessed via the generated link.
it displays the reset form.
*/
app.get('/resetpass/:id/:token', (req, res, next) => {
  authentication
    .then(() => client.callFunction('findUserById', [ObjectID(req.params.id)]))
    .then((user) => {
      if (user) {
        const secret = user.password + user._id.getTimestamp().toString();
        try {
          const payload = jwt.decode(req.params.token, secret);
          res.send(`${'<form action="/resetpass/success" method="POST">'
          + '<input type="hidden" name="id" value="'}${payload.id}" />`
          + `<input type="hidden" name="token" value="${req.params.token}" />`
          + '<input type="password" name="password" value="" placeholder="Enter your new password..." />'
          + '<input type="submit" value="Reset Password" />'
          + '</form>');

          /*
            during final stages of production, send a JSON response instead.
            {
              id: <id of user; here it's payload.id>,
              token: <token; here it's req.params.token>
            }
          */
        }
        catch (err) {
          res.end('token is invalid, fool');
        }
      }
      else res.send('user doesn\'t exist');
    })
    .catch(err => next(err));
});

/*
this endpoint displays the success of the password change.
it's hit when reset button is clicked in the form where new pwd is entered.
expects id, token and password in body of request (i.e. incoming JSON)
*/
app.post('/resetpass/success', (req, res, next) => {
  authentication
    .then(() => client.callFunction('findUserById', [ObjectID(req.body.id)]))
    .then((user) => {
      if (user) {
        /* eslint-disable */
        const secret = user.password + user._id.getTimestamp().toString();
        try {
          const payload = jwt.decode(req.body.token, secret);
					/* eslint-enable */
          return bcrypt.genSalt();
        }
        catch (e) {
          return res.end('token is invalid, fool');
        }
      }
      return res.send('user doesn\'t exist');
    })
    .then(salt => bcrypt.hash(req.body.password, salt))
    .then(hash => client.callFunction('updateUserById', [ObjectID(req.body.id), { password: hash }]))
    .then(() => res.end('success!!!!'))
    .catch(err => next(err));
});

// Starting server to listen
const port = process.env.PORT || 3000;
app.listen(port, () => console.info(`Listening in port ${port}`));
