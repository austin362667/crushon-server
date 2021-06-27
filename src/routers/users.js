const express = require('express');
// const bodyParser = require('body-parser');
const { v4: uuid } = require('uuid');
var jwt = require('jsonwebtoken');
const accessController = require('../middleware/access-controller.js');
var gcm = require('node-gcm');
const userModel = require('../model/user.js');
const KEY = "awesomeAustin"
const router = express.Router();

// AWS S3 
const AWS = require("aws-sdk");
var bodyParser = require("body-parser");
require('dotenv').config();

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

// Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
var sender = new gcm.Sender('AAAA4ozA9jE:APA91bEvb8Fj7rvSycDTtz60Qv-OMEU0i1O59RDxNo7qanLuZhhT6jjnppMufkxWL3bq6PkUaFAB5mcOdBYHfd-cxjL_U9LiYpzNqChxzH5EEnievjjdQS-nzRiMxmbzn3WMlcRPSRul');
var messageGood = new gcm.Message({
	collapseKey: 'demo',
	priority: 'high',
	contentAvailable: true,
	delayWhileIdle: true,
	// timeToLive: 3,// default => 4 weeks
	dryRun: false,//false => not test message
	data: {
		// key1: 'message1',
		// key2: 'message2'
	},
	notification: {
    sound:true,
		title: "🔔🔔戀愛鈴:Crushon",
		icon: "ic_launcher",
		body: "您的戀愛鈴被敲響了\n方圓1km內有您的愛慕者!"
	}
});
// var messageBad = new gcm.Message({
// 	collapseKey: 'demo',
// 	priority: 'high',
// 	contentAvailable: true,
// 	delayWhileIdle: true,
// 	// timeToLive: 3,// default => 4 weeks
// 	dryRun: false,//false => not test message
// 	data: {
// 		// key1: 'message1',
// 		// key2: 'message2'
// 	},
// 	notification: {
//     sound:true,
// 		title: "🔔戀愛鈴:Crushon",
// 		icon: "ic_launcher",
// 		body: "您的愛慕者可能在100m以外..\n出去走走蒐集愛心吧~"
// 	}
// });


// Create Follow
router.post('/createFollow', function (req, res, next) {
  var regTokensGood = [];
  var regTokensBad = [];

  const { from, to } = req.body;
  // var str = req.get('Authorization');
  // jwt.verify(str, KEY, {algorithm: 'HS256'});
  const id = uuid();
  userModel
    .follow( id, from, to )
    .then(() => {

      userModel.list_id(to).then((users) => {
        regTokensGood.push(users[0].token)
      })
      sender.send(messageGood, { registrationTokens: regTokensGood }, function (err, response) {
        if (err) console.error(err);
        else console.log(response);
      });


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

// Update User Push Token
router.post('/user_token',
  function (req, res, next) {
    const { id, token } = req.body;
    if (!id) {
      const err = new Error('User ID and Push Token are required');
      err.status = 400;
      throw err;
    }
    userModel
      .update_token(id, token)
      .then((user) => {
        res.json(user);
      })
      .catch(next);
  }
);


// Get User One 
router.post('/getTheOne', function (req, res, next) {
  const { id } = req.body;
  // var str = req.get('Authorization');
  // jwt.verify(str, KEY, {algorithm: 'HS256'});
  userModel
    .list_follower(id)
    .then((users) => {
      userModel.list_id(users[0]['followee'])
        .then(async (users) => {
          const source = await userModel.list_id(id);
          const target = users;
          const λ1 = source[0]['long']
          const φ1 = source[0]['lat']
          const λ2 = target[0]['long']
          const φ2 = target[0]['lat']
          // console.log(λ1, φ1, λ2, φ2)
          const y = Math.sin(λ2-λ1) * Math.cos(φ2);
          const x = Math.cos(φ1)*Math.sin(φ2) -
                    Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
          const θ = Math.atan2(y, x);
          // console.log(θ)
          const brng = (θ*180/Math.PI + 360) % 360; // in degrees
          res.json(brng);
        })
    })
    .catch(next);
});




// AWS.config.update({ region: process.env.region });
// const S3_BUCKET = process.env.bucketName;
// const s3 = new AWS.S3({
//   accessKeyId: process.env.accessKeyId,
//   secretAccessKey: process.env.secretAccessKey,
//   region: process.env.region,
//   signatureVersion: "v4",
//   //   useAccelerateEndpoint: true
// });

// const getPresignedUrl = (req, res) => {
//   let fileType = req.body.fileType;
//   if (fileType != ".jpg" && fileType != ".png" && fileType != ".jpeg") {
//     return res
//       .status(403)
//       .json({ success: false, message: "Image format invalid" });
//   }

//   fileType = fileType.substring(1, fileType.length);

//   const fileName = uuid();
//   const s3Params = {
//     Bucket: S3_BUCKET,
//     Key: fileName + "." + fileType,
//     Expires: 60 * 60,
//     ContentType: "image/" + fileType,
//     ACL: "public-read",
//   };

//   s3.getSignedUrl("putObject", s3Params, (err, data) => {
//     if (err) {
//       console.log(err);
//       return res.end();
//     }

//     const returnData = {
//       success: true,
//       message: "Url generated",
//       uploadUrl: data,
//       downloadUrl:
//         `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}` + "." + fileType,
//     };

//     userModel
//       .update_photo(id, returnData['downloadUrl'])
//         .then((user) => {
//         });
//     return res.status(201).json(returnData);
//   });
// };


// const getPresignedUrl = async (req, res) => {

//   const fileName = req.body.fileName
//   const S3_BUCKET = 'image-picker-uploads'
//   const s3 = new AWS.S3();  // Create a new instance of S3

//   // Set up the payload of what we are sending to the S3 api
//   const s3Params = {
//     Bucket: S3_BUCKET,
//     Key: fileName,
//     Expires: 5000,
//     //ContentType: fileType,
//     // ACL: 'public-read',
//     // ContentType: 'application/octet-stream'
//   };
//   // Make a request to the S3 API to get a signed URL which we can use to upload our file

//   try {
//     const data = await s3.getSignedUrlPromise('getObject', s3Params);
//     const returnData = {
//       signedRequest: data,
//       url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
//     };
//     userModel
//       .update_photo('5a4b2e10-aca5-46e6-b82d-9b890b0d660f', returnData['url'])
//         .then((user) => {
//         });
  
//     return res.json(returnData);

//   } catch (err) {
//     console.log('err: ', err);
//   }
// }

// router.post("/generatePresignedUrl", (req, res) => getPresignedUrl(req, res));




module.exports = router;
