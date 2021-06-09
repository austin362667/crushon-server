const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuid } = require('uuid');
var jwt = require('jsonwebtoken');
const accessController = require('../middleware/access-controller.js');

const userModel = require('../model/user.js');
const KEY = "awesomeAustin"
const router = express.Router();

router.use(express.json());
router.use(accessController); // Allows cross-origin HTTP requests

// List ALl Users
router.get('/users', function (req, res, next) {
  // var str = req.get('Authorization');
  // jwt.verify(str, KEY, {algorithm: 'HS256'});
  userModel
    .list()
    .then((users) => {
      res.json(users[0]);
    })
    .catch(next);
});


// List User By ID
router.post('/user_id', function (req, res, next) {
  const { id } = req.query;
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
