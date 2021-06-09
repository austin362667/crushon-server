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

// List User
router.get('/users', function (req, res, next) {
  const { searchText, lat, long, id } = req.query;
  userModel
    .list(searchText, lat, long, id)
    .then((users) => {
      res.json(users);
    })
    .catch(next);
});

// Single Sign On
router.post('/sso', 
  function (req, res, next) {
  const { name, sso, email, photo } = req.body;

  userModel
    .one_sso(sso)
    .then((users) => {
      console.log(users)
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
            console.log(user)
            var payload = {
              username: user.name,
              userid: user.id,
            };
            var token = jwt.sign(payload, KEY, {algorithm: 'HS256', expiresIn: "365d"});
            res.send(token)
          })
          res.send(token)

      }
    })
    .catch(next);

});


// Update User Location
router.post('/user',
  function (req, res, next) {
    const { id, lat, long } = req.body;
    if ((!lat || !long) || !id) {
      const err = new Error('User ID and Location are required');
      err.status = 400;
      throw err;
    }
    userModel
      .update(id, lat, long)
      .then((user) => {
        res.json(user);
      })
      .catch(next);
  }
);

module.exports = router;
