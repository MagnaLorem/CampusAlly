'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  Userclasses = require(path.resolve('./modules/myclasses/server/models/userclasses.server.model')),
  User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function (req, res) {
  // Init Variables
  var user = req.user;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  console.log(req.body);

  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function (err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.json(user);
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Update the user's classes
 */
 exports.updateclasses = function (req, res) {
   // Create a new model
   var newUserclasses = new Userclasses();

   console.log("Request Body: " + req.body);

   // Set userId to the given userId
   newUserclasses.userId = req.body.userId; 
   for(var i = 0; i < req.body.courses.length; i++){
    // Create a new variable for each course and set its fields to the given values
    var newClass = {
      "classId": req.body.courses[i]._id,
      "courseCode": req.body.courses[i].courseCode,
      "name": req.body.courses[i].name
    };

    // Push each class into the courses array
    newUserclasses.courses.push(newClass);  
   }

   // Check to see if it is correct
   console.log("New Model to be Added: " + newUserclasses);

   // Save the new list of classes for the user
   newUserclasses.save(function(err) {
    if(err){
      console.log(err);
      res.status(400).send(err);
    } else {
      console.log("Successfully created userclasses!\n" + newUserclasses);
      res.json(newUserclasses);
    }
   });
 }

/**
 * Get user's classes
 */
 exports.getclasses = function(req, res) {
    console.log(req.user);
    var thisuserId = req.user._id;
    
    Userclasses.findOne({ userId: thisuserId }).exec(function (err, object) {
      console.log(object);
      res.json(object);
    });
 }

/**
 * Update profile picture
 */
exports.changeProfilePicture = function (req, res) {
  var user = req.user;
  var message = null;

  if (user) {
    fs.writeFile('./modules/users/client/img/profile/uploads/' + req.files.file.name, req.files.file.buffer, function (uploadError) {
      if (uploadError) {
        return res.status(400).send({
          message: 'Error occurred while uploading profile picture'
        });
      } else {
        user.profileImageURL = 'modules/users/img/profile/uploads/' + req.files.file.name;

        user.save(function (saveError) {
          if (saveError) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(saveError)
            });
          } else {
            req.login(user, function (err) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.json(user);
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Send User
 */
exports.me = function (req, res) {
  res.json(req.user || null);
};
