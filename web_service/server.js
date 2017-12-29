#!/usr/bin/env node
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const firebase = require('./firebase');

const app = express();

//  Middle-ware for handling post requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// START Web Socket functions
// END Web Socket functions


// START *** Settings headers to allow cross domain requests
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
// END *****


// START *** Express deals with urls

app.post('/broadcastImgUpload', function(req, res) {
  const imageKey = req.body.imageKey;
  
  if (!imageKey) {
    res.status(500).send('no image key');
  }

  firebase.broadcastImageUpdate(imageKey);
});

app.post('/watchGroupImage', function(req, res) {
  const imageId = req.body.imageId;
  const groupId = req.body.groupId;

  firebase.watchGroupImage(groupId, imageId);
});

app.post('/uploadComment', function(req, res) {
  const imageId = req.body.imageId;
  const groupId = req.body.groupId;
  const userId = req.body.userId;
  const comment = req.body.comment;
  const author = req.body.author;
  
  firebase.uploadComment(groupId, imageId, userId, comment, author)
    .then((response) => {
      console.log(response);
      res.send(response);
    })
    .catch(function (error) {
      // console.log(error);
      res.status(500).send(error);
    });
});

app.post('/updateLikes', function(req, res) {
  const userId = req.body.userId;
  const imageId = req.body.imageId;
  const groupId = req.body.groupId;
  const addLike = req.body.addLike;

  firebase.updateLike(userId, imageId, groupId, addLike)
    .then(function(response) {
      res.send(response);
    })
    .catch(function (error) {
      // console.log(error);
      res.status(500).send(error);
    });
});

app.post('/imageUpload', function(req, res) {
  const name = req.body.name;
  const group = req.body.group;
  const user = req.body.userId;
  const userName = req.body.userName;
  const fileType = req.body.fileType;

  firebase.saveImageRef(name, group, user, fileType, userName)
    .then(function(response) {
      res.send(response);
    })
    .catch(function (error) {
      // console.log(error);
      res.status(500).send(error);
    });
});

app.post('/getGroupInfo', function(req, res) {
  const groupId = req.body.groupId;
  // console.log('getGroupInfo');

  firebase.getGroupInfo(groupId)
    .then((response) => {
      // console.log(response);
      res.send(response);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

app.post('/ImgToUser', function(req, res) {
  const imageKey = req.body.imageKey;
  const group = req.body.group;
  const user = req.body.user;
  const fileType = req.body.fileType;
  const imageName = req.body.imageName;
  // console.log('/ImgToUser');

  firebase.associateImgToUser(imageKey, group, user, fileType, imageName)
    .then(function(response) {
      // console.log(response);
      res.send(response);
    })
    .catch(function (error) {
      // console.log(error);
      res.status(500).send(error);
    });
});

app.post('/ImgToGroup', function(req, res) {
  const imageKey = req.body.imageKey;
  const group = req.body.group;
  const user = req.body.user;
  const fileType = req.body.fileType;
  const imageName = req.body.imageName;
  // console.log('/ImgToGroup');

  firebase.associateImgToGroup(imageKey, group, user, fileType, imageName)
    .then(function(response) {
      res.send(response);
    })
    .catch(function (error) {
      // console.log(error);
      res.status(500).send(error);
    });
});

app.post('/GroupToUser', function(req, res) {
  const groupId = req.body.groupId;
  const userId = req.body.userId;
  const groupName = req.body.groupName;
  // console.log('/GroupToUser: ' + groupName);

  firebase.associateGroupToUser(groupId, userId, groupName)
    .then(function(response) {
      res.send(response);
    })
    .catch(function (error) {
      // console.log(error);
      res.status(500).send(error);
    });
});

app.post('/getGroups', function(req, res) {
  const userId = req.body.userId;

  firebase.getGroups(userId)
    .then(function(response) {
      res.send(response);
    })
    .catch(function (error) {
      console.log(error);
      res.status(500).send(error);
    });
});

app.post('/addGroup', function(req, res) {
  const user = req.body.user;
  const userName = req.body.userName;
  const groupName = req.body.groupName;

  firebase.addGroup(user, groupName, userName)
    .then(function(response) {
      // console.log(response);
      res.send(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
});

app.post('/getImageInfo', function(req, res) {
  const imageId = req.body.imageId;

  firebase.getImageInfo(imageId)
    .then(function(response) {
      // console.log(response);
      res.send(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
});

app.post('/joinGroup', function(req, res) {
  const user = req.body.user;
  const userName = req.body.userName;
  const groupId = req.body.groupId;

  firebase.joinGroup(user, groupId, userName)
    .then(function(response) {
      if (response.userexists) {
        // res.status(304).send(response);
        res.send(response);
      } else {
        res.send(response);
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send(err);
    });
});

app.post('/addUser', function(req, res) {
  const user = req.body.user;
  const name = req.body.name;
  const email = req.body.email;
  // const img = req.body.img;

  firebase.addUser(user, name, email)
    .then(function(response) {
      // console.log(response);
      res.send(response);
    })
    .catch(function (error) {
      // console.log(error);
      res.status(500).send(error);
    });
});

app.post('/signedIn', function (req, res) {
  const id_token = req.body.id_token;
  // console.log('id_token');
  // console.log(id_token);

  if (!id_token) {
    res.status(500).send('error');
    return;
  }

  firebase.googleAuth(id_token)
    .then(function() {
      // console.log(fulfilled);
      res.sendStatus(200);
    })
    .catch(function (error) {
      // console.log(error);
      res.status(500).send(error);
    });
});

app.get('/test', function (req, res) {
    res.send('Testing');
    console.log(req.client.remoteAddress);
});
// END *****


// START *** Use Express to listen to port
app.listen(4000, '138.68.135.21', function () {
  firebase.initFirebase();
  console.log('init');
});
// END *****

