const express = require('express');
// const bodyParser = require('body-parser');
const { v4: uuid } = require('uuid');
var jwt = require('jsonwebtoken');
const accessController = require('../middleware/access-controller.js');

const userModel = require('../model/user.js');
const KEY = "awesomeAustin"
const router = express.Router();

router.use(express.json());
router.use(accessController); // Allows cross-origin HTTP requests

// List All Users
router.get('/users', function (req, res, next) {
  // var str = req.get('Authorization');
  // jwt.verify(str, KEY, {algorithm: 'HS256'});
  userModel
    .list()
    .then((users) => {
      res.json(users);
    })
    .catch(next);
});


// List User By ID
router.post('/user_id', function (req, res, next) {
  const { id } = req.body;
  // var str = req.get('Authorization');
  // jwt.verify(str, KEY, {algorithm: 'HS256'});
  if (!id) {
    const err = new Error('User ID is required');
    err.status = 400;
    throw err;
  }
  userModel
    .list_id(id)
    .then((users) => {
      if(users.length === 1){
      res.json(users[0]);
      }
    })
    .catch(next);
});

// Count User By Followee
router.post('/getUserRank', function (req, res, next) {
  const { id } = req.body;
  // var str = req.get('Authorization');
  // jwt.verify(str, KEY, {algorithm: 'HS256'});
  userModel
    .list_followee(id)
    .then((users) => {
      userModel
        .list_followee(null)
        .then((all_follows) => {
        res.json(users.length/all_follows.length);
    })
    })
    .catch(next);
});


// List User By Followee
router.post('/getUserLikeNum', function (req, res, next) {
  const { id } = req.body;
  // var str = req.get('Authorization');
  // jwt.verify(str, KEY, {algorithm: 'HS256'});
  userModel
    .list_followee(id)
    .then((users) => {
      res.json(users.length);
    })
    .catch(next);
});

// Create Follow
router.post('/createFollow', function (req, res, next) {
  const { from, to } = req.body;
  // var str = req.get('Authorization');
  // jwt.verify(str, KEY, {algorithm: 'HS256'});
  const id = uuid();
  userModel
    .follow( id, from, to )
    .then(() => {
      res.json('ok');
    })
    .catch(next);
});

// List User Near By
router.post('/getUserNearBy', function (req, res, next) {
  const { lat, long } = req.body;
  // var str = req.get('Authorization');
  // jwt.verify(str, KEY, {algorithm: 'HS256'});
  userModel
    .list_location(lat, long)
    .then((users) => {
      res.json(users);
    })
    .catch(next);
});


// Single Sign On
router.post('/sso', 
  function (req, res, next) {
  const { name, sso, email, photo } = req.body;
// console.log(name, sso, email, photo)
  userModel
    .list_sso(sso)
    .then((users) => {
      // console.log(users.length)
      if(users.length === 1){
        var payload = {
          username: users[0].name,
          userid: users[0].id,
        };
        var token = jwt.sign(payload, KEY, {algorithm: 'HS256', expiresIn: "365d"});
        res.send(token)
      }else{
        const id = uuid();
        userModel
          .create(id, name, sso, email, photo)
          .then((user) => {
            // console.log(user.name)
            var payload = {
              username: user.name,
              userid: user.id,
            };
            var token = jwt.sign(payload, KEY, {algorithm: 'HS256', expiresIn: "365d"});
            res.send(token)
          })

      }
    })
    .catch(next);

});


// Update User Location
router.post('/user_location',
  function (req, res, next) {
    const { id, lat, long } = req.body;
    if ((!lat || !long) || !id) {
      const err = new Error('User ID and Location are required');
      err.status = 400;
      throw err;
    }
    userModel
      .update_location(id, lat, long)
      .then((user) => {
        res.json(user);
      })
      .catch(next);
  }
);

module.exports = router;
