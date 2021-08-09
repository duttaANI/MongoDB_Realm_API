/* eslint-disable linebreak-style */
// server/controllers/userController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Gives a StackTraceLimit function limit Error!!!.

// Initializing stitch
const {
  Stitch,
  ServerApiKeyCredential,
  RemoteMongoClient
} = require('mongodb-stitch-server-sdk');

const {
  RemoteUpdateOptions
} = require('mongodb-stitch-core-services-mongodb-remote');

const client = Stitch.initializeDefaultAppClient('clubhub-ulzhy');
const mongoClient = client.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas');
const mongoAPIKey = 'Ci3yXDebGpV0DOZiDRteFuBn2N7cTmu40ezsvEz8VvytuKadwNz2IEKAdpPvLOlu';
const credential = new ServerApiKeyCredential(mongoAPIKey);

// Initializing express
const express = require('express');

const app = express();

// Body-parser
const bodyParser = require('body-parser');
const { roles } = require('../roles');
const User = require('../models/userModel');

app.use(bodyParser.urlencoded({ extended: false }));

// Default directory
// app.use(express.static('./public'));

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.signup = async (req, res, next) => {
  try {
    //POST request at '/user_push' to gather user details
 // app.post('/user_push',async(req,res)=>{
  console.log("Trying to create a new user!");
  console.log("First name: "+req.body.first_name);
  console.log("Last name: "+req.body.last_name);
  console.log("Email: "+req.body.email_id);
  console.log("password: "+req.body.password);
  console.log("Registration ID: "+req.body.reg_id);
  console.log("Phone number: "+req.body.ph_no);
  console.log("Whatsapp nunmber: "+req.body.whatsapp_no);
  const nam= req.body.first_name;
  const num= req.body.ph_no;
  const newUser=[{nam,num}];
  try{
      const salt=await bcrypt.genSalt();
      const hashedPass=await bcrypt.hash(req.body.password,salt);
      console.log(hashedPass);
      //Calls stitch function to push document
      client.auth.loginWithCredential(credential).then(async credential=>{
              await client.callFunction("createNewUser",[{Name:req.body.first_name +' '+req.body.last_name, 
              email:req.body.email_id,
              password:hashedPass,
              registration_id:req.body.reg_id,
              phone_number:req.body.ph_no,
              whatsapp_no:req.body.whatsapp_no,
              role:'basic'}]).then(result => {
              console.trace("Pushed Successfully")
          }).catch(result=>{console.log("Failed")});
          console.trace();
      }).catch(console.log(Error));        
  }catch {
      console.log(Error);
  }      
  
  res.json({
    data:newUser
  });

}
    /* const { email, password, role } = req.body;
    const hashedPassword = await hashPassword(password);
    const newUser = new User({ email, password: hashedPassword, role: role || 'basic' });
    const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    newUser.accessToken = accessToken;
    await newUser.save();
    res.json({
      data: newUser,
      accessToken
    }); */
  
  catch (error) {
    next(error);
  }
  
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new Error('Email does not exist'));
    const validPassword = await validatePassword(password, user.password);
    if (!validPassword) return next(new Error('Password is not correct'));
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });
    await User.findByIdAndUpdate(user._id, { accessToken });
    res.status(200).json({
      data: { email: user.email, role: user.role },
      accessToken
    });
  }
  catch (error) {
    next(error);
  }
};
exports.getUsers = async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    data: users
  });
};

exports.getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return next(new Error('User does not exist'));
    res.status(200).json({
      data: user
    });
  }
  catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  var user;
  try {
    const { userId } = req.params;
    user = await User.findById(userId);
    const update = req.body;
    if (user.role === 'superadmin') {
      res.status(200).json({
        data: user,
        message: 'ERROR: You can not convert superadmin to any other role'
      });
    }
    else if (req.body.role === 'admin') {
      await User.findByIdAndUpdate(userId, update);
      user.role = 'admin';
      res.status(200).json({
        data: user,
        message: 'User is promoted to admin'
      });
    }
    else if (req.body.role === 'basic') {
      await User.findByIdAndUpdate(userId, update);
      user.role = 'basic';
      res.status(200).json({
        data: user,
        message: 'User is converted to basic'
      });
    }
    else {
      res.status(200).json({
        data: user,
        message: 'ERROR: You can not convert user to the given role!'
      });
    }
  }
  catch (error) {
    next(error);
  }
};
/* exports.updateUser = async (req, res, next) => {
  try {
    const update = req.body;
    const { userId } = req.params;
    await User.findByIdAndUpdate(userId, update);
    const user = await User.findById(userId);
    res.status(200).json({
      data: user,
      message: 'User has been updated'
    });
  }
  catch (error) {
    next(error);
  }
}; */

exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.status(200).json({
      data: null,
      message: 'User has been deleted'
    });
  }
  catch (error) {
    next(error);
  }
};
exports.grantAccess = function (action, resource) {
  return async (req, res, next) => {
    try {
      const permission = roles.can(req.user.role)[action](resource);
      if (!permission.granted) {
        return res.status(401).json({
          error: "You don't have enough permission to perform this action"
        });
      }
      next();
    }
    catch (error) {
      next(error);
    }
  };
};

exports.allowIfLoggedin = async (req, res, next) => {
  try {
    const user = res.locals.loggedInUser;
    if (!user) {
      return res.status(401).json({
        error: 'You need to be logged in to access this route'
      });
    }
    req.user = user;
    next();
  }
  catch (error) {
    next(error);
  }
};
