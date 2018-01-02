const https = require('https');
const fs = require('fs');
const express = require('express');
const webSocket = require('ws')
const webSocketServer = webSocket.Server;
//const wss = new webSocketServer({ port: 4500});

const app = express();
const options = {
  cert: fs.readFileSync('./certs/fullchain.pem'),
  key: fs.readFileSync('./certs/privkey.pem')
};

const server = https.createServer(options, app);
const wss = new webSocketServer({
  server
});

// firebase connection
const firebase = require('firebase');
const admin = require("firebase-admin");
const { configVariables } = require('./private-config.js');

const serviceAccount = require('./photogroups-4c0ba-firebase-adminsdk-9tv4c-5076a7e35d.json');

let dateTimeNow = null;
let dateNow = null;
let timeNow = null;
const getTimeDate = function() {
  // time and date 
  const jsDate = new Date();
  const year = jsDate.getFullYear();
  const month = jsDate.getMonth() + 1;
  const date = jsDate.getDate();
  const hours = jsDate.getHours();
  let mins = jsDate.getMinutes();
  mins = mins < 10 ? '0' + mins : mins;
  dateTimeNow = year + '-' + month + '-' + date + ' ' + hours + ':' + mins;
  dateNow = year + '-' + month + '-' + date;
  timeNow = hours + ':' + mins;
};

// Initialize Firebase
const config = {
  apiKey: configVariables.apiKey,
  authDomain: configVariables.authDomain,
  databaseURL: configVariables.databaseURL,
  projectId: configVariables.projectId,
  storageBucket: configVariables.storageBucket,
  messagingSenderId: configVariables.messagingSenderId
};


// START *** Use WebSocket (ws)
wss.on('connection', function connection(ws) {
  // console.log('init ws');
  ws.send('hello');
});

server.listen(4500);
// END *****

module.exports = {

  initFirebase() {
    firebase.initializeApp(config);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: configVariables.databaseURL,
      databaseAuthVariableOverride: {
        uid: "db-editor"
      }
    });
  },

  getGroupInfo(groupId) {
    // console.log('getGroupInfo firebase');

    return new Promise(function(resolve, reject) {
      
      admin.database().ref('Groups/').child(groupId).once('value', function(snapshot) {
        const groupExists = (snapshot.val() !== null) ? true : false;
        if (groupExists) {
          resolve({"groupExists": true, "data": snapshot});
        } else {
          // console.log('getGroupInfo firebase: group doesnt exist');
          resolve({"groupExists": false});
        }
      })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    });
  },

  watchGroupImage(groupId, imageId) {

    if (!groupId || !imageId) {
      return;
    }

    admin.database().ref(`Groups/${groupId}/Images/`).child(imageId).on('value', function(dataSnapshot) {

      wss.clients.forEach(function each(client) {
        if (client.readyState === webSocket.OPEN) {
          const objectString = JSON.stringify(
            {
              "update": "imageUpdated",
              groupId,
              imageId,
              "likes": dataSnapshot.val().likes ? dataSnapshot.val().likes : 0,
              "comments": dataSnapshot.val().comments ? dataSnapshot.val().comments : 0
            }
          );
          client.send(objectString);
        }
      });
    });
  },

  getImageInfo(imageId) {
    // console.log('getImageInfo firebase');
    
    return new Promise(function(resolve, reject) {
      // console.log(imageId);
      
      admin.database().ref('Images/').child(imageId).once('value', function(snapshot) {
        const imageExists = (snapshot.val() !== null) ? true : false;

        if (imageExists) {
          // console.log('getGroupInfo firebase: image exists');
          resolve({"imageExists": true, "data": snapshot});
        } else {
          // console.log('getImageInfo firebase: image doesnt exist');
          resolve({"getImageInfo": false});
        }
      })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    });
  },

  broadcastImageUpdate(imageId, groupId) {

    if (!imageId || !groupId) {
      return;
    }

    admin.database().ref(`Groups/${groupId}/Images/`).child(imageId).once('value', function(snapshot) {
      const imageExists = (snapshot.val() !== null) ? true : false;

      if (imageExists) {

        wss.clients.forEach(function each(client) {
          if (client.readyState === webSocket.OPEN) {
            const snapshotData = snapshot.val();
            const imagesString = JSON.stringify(
              {
                "update": "new image",
                [imageId]: snapshotData,
                groupId
              }
            );
            client.send(imagesString);
          }
        });
      }
    })
      .catch(err => {
        console.log(err);
      });
  },

  uploadComment(groupId, imageId, userId, comment, author) {
    let groupImgExists = false;
    
    return new Promise(function(resolve, reject) {
      admin.database().ref(`Groups/${groupId}/Images/`).child(imageId).once('value', function(snapshot) {
        groupImgExists = (snapshot.val() !== null) ? true : false;

        getTimeDate();

        if (groupImgExists) {
          let errored = false;
          admin.database().ref(`Groups/${groupId}/Images/${imageId}/comments`).push({
            userId,
            comment,
            dateTimeAdded: dateTimeNow,
            dateAdded: dateNow,
            timeAdded: timeNow,
            author
          })
            .catch(err => {
              console.log(err);
              reject(err.message);
              errored = true;
            })
            .then(() => {

              if (!errored) {
                resolve({"commentAdded": true});
              }
            });
        } else {
          reject("group and img don't exist");
        }
      })
        .catch(err => {
          console.log(err);
          reject(err.message);
        });
    });
  },

  associateImgToUser(imageKey, group, user, fileType, imageName) {
    let userExists = false;

    return new Promise(function(resolve, reject) {
      
      admin.database().ref('Users/').child(user).once('value', function(snapshot) {
        userExists = (snapshot.val() !== null) ? true : false;
      })
        .then(function(e) {
          let errored = false;

          if (userExists) {
            getTimeDate();

            admin.database().ref(`Users/${user}/Images/${imageKey}`).update({
              fileType,
              imageName,
              group,
              dateAdded: dateNow,
              timeAdded: timeNow,
              dateTimeAdded: dateTimeNow
            })
              .catch(err => {
                console.log(err);
                errored = true;
                reject(err.message);
              })
              .then(() => {

                if (!errored) {
                  resolve({'success': true});
                }
              });
          } else {
            resolve({'userExists': true});
          }
        })
        .catch(err => {
          console.log(err);
          reject(err.message);
        });
    });
  },

  associateImgToGroup(imageKey, group, user, fileType, imageName, userName) {
    let groupExists = false;

    return new Promise(function(resolve, reject) {

      admin.database().ref('Groups/').child(group).once('value', function(snapshot) {
        groupExists = (snapshot.val() !== null) ? true : false;
      })
        .then(function(e) {
          let errored = false;

          if (groupExists) {
            getTimeDate();

            admin.database().ref(`Groups/${group}/Images/${imageKey}`).update({
              fileType,
              imageName,
              user,
              userName,
              dateAdded: dateNow,
              timeAdded: timeNow,
              dateTimeAdded: dateTimeNow
            })
              .catch(err => {
                console.log(err);
                errored = true;
                reject(err.message);
              })
              .then(() => {

                if (!errored) {
                  resolve({'addedToGroup': true});
                }
              });
          } else {
            resolve({'addedToGroup': false});
          }
        })
        .catch(err => {
          console.log(err);
          reject(err.message);
        });
    });
  },

  getGroups(userId) {

    return new Promise(function(resolve, reject) {
      admin.database().ref('Users/').child(userId).once('value', function(snapshot) {
        const userExists = (snapshot.val() !== null) ? true : false;
        const groupsArray = [];
        if (userExists) {
          snapshot.child('Groups').forEach(function(childSnapshot) {
            const childKey = childSnapshot.key;
            const childVal = childSnapshot.val();
            groupsArray.push({id: childKey, val: childVal});
          });
          // console.log(groupsArray);
          resolve({"success": true, groups: groupsArray});
        } else {
          resolve({'userExists': false});
        }
      })
        .catch(err => {
          console.log(err);
          reject(err.message);
        })
    });
  },

  associateGroupToUser(groupId, userId, groupName) {
    let userExists = false;

    return new Promise(function(resolve, reject) {

      admin.database().ref('Users/').child(userId).once('value', function(snapshot) {
        userExists = (snapshot.val() !== null) ? true : false;
      })
        .then(function(e) {
          let errored = false;

          if (userExists) {
            admin.database().ref(`Users/${userId}/Groups`).update({
              [groupId]: groupName
            })
              .catch(err => {
                console.log(err);
                errored = true;
                reject(err.message);
              })
              .then(() => {

                if (!errored) {
                  resolve({'message': 'group added to user'});
                }
              });
          } else {
            resolve({'userExists': false});
          }
        })
        .catch(err => {
          console.log(err);
          reject(err.message);
        });
    });
  },

  joinGroup(user, groupId, userName) {
    let groupExists = false;
    let groupName = null;
    let userAlreadyRegistered = false;
    // console.log('---- JOIN GROUP ----');
    // console.log(user);
    // console.log(groupId);

    return new Promise(function(resolve, reject) {

      admin.database().ref('Groups/').child(groupId).once('value', function(snapshot) {
        groupExists = (snapshot.val() !== null) ? true : false;
        groupName = (snapshot.val() && snapshot.val().groupName) || null;
        userAlreadyRegistered = (snapshot.val() && snapshot.child('Users').hasChild(user)) ? true : false;
      })
        .then(function(e) {
          let errored = false;

          if (userAlreadyRegistered) {
            resolve({"userexists": true, groupName});
            return;
          }

          if (groupExists) {

            admin.database().ref(`Groups/${groupId}/Users/`).update({
              [user]: userName
            })
              .catch(err => {
                console.log(err);
                errored = true;
                reject(err.message);
              })
              .then(res => {
                if (!errored) {
                  resolve({"added user": true, groupName});
                }
              });
          }
        })
        .catch(err => {
          console.log(err);
          reject(err.message);
        });
    });
  },

  addGroup(user, groupName, userName) {
    const database = admin.database().ref('Groups/').push({
      "creator": user,
      "groupName": groupName
    });
    let errored = false;

    return new Promise(function(resolve, reject) {
      database
        .catch(function(error) {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          errored = true;
          reject(errorMessage);
        })
        .then(function (e) {
          const key = database.getKey();
          let errored = false;

          if (!errored) {
            admin.database().ref(`Groups/${key}/Users/`).update({
              [user]: userName
            })
              .catch(err => {
                errored = true;
                resolve({"group added":true, "added user": false, key});
              })
              .then(() => {
                
                if (!errored) {
                  resolve({"group added":true, "added user": true, key});
                }
              });
          }
        });
    });
  },

  addUser(user, name, email) {
    let userExists = false;

    return new Promise(function(resolve, reject) {

      admin.database().ref('Users/').child(user).once('value', function(snapshot) {
        userExists = (snapshot.val() !== null) ? true : false;
      })
        .then(function(e) {
          let errored = false;

          if (!userExists) {
            getTimeDate();

            admin.database().ref(`Users/${user}`).set({
              email,
              name,
              dateAdded: dateNow,
              timeAdded: timeNow,
              dateTimeAdded: dateTimeNow
            })
              .catch(err => {
                console.log(err);
                errored = true;
              })
              .then(res => {
                // console.log(res);

                if (!errored) {
                  resolve({"mssg":'success'});
                }
              });
          } else {
            resolve({'userExists': true});
          }
        })
        .catch(err => {
          console.log(err);
          reject(err.message);
        });
    });
  },

  updateLike(userId, imageId, groupId, addLike) {
    let imageEntryExists = false;
    
    return new Promise(function(resolve, reject) {

      if (!userId || !imageId || !groupId) {
        reject("missing params");
      }

      admin.database().ref(`Groups/${groupId}/Images/`).child(imageId).once('value', function(snapshot) {
        imageEntryExists = (snapshot.val() !== null) ? true : false;
      })
        .then(e => {
          if (imageEntryExists) {

            if (addLike) {
              let errored = false;
              admin.database().ref(`Groups/${groupId}/Images/${imageId}/likes/`).update({
                [userId]: true
              })
                .catch(err => {
                  console.log(err);
                  errored = true;
                  reject(err.message);
                })
                .then(() => {

                  if (!errored) {
                    resolve({'addedLike': true});
                  }
                });
            } else {
              let errored = false;
              admin.database().ref(`Groups/${groupId}/Images/${imageId}/likes/`).child(userId).remove()
                .catch(err => {
                  console.log(err);
                  errored = true;
                  reject(err.message);
                })
                .then(() => {
                  if (!errored) {
                    resolve({'removedLike': true});
                  }
                });
            }
          } else {
            reject("no entry for group and image");
          }
        })
        .catch(err => {
          console.log(err);
          reject(err.message);
        });
    });
  },

  saveImageRef(name, group, user, fileType, userName) {
    getTimeDate();
    
    const database = admin.database().ref(`Images/`).push({
      imageName: name,
      user,
      userName,
      dateAdded: dateNow,
      timeAdded: timeNow,
      dateTimeAdded: dateTimeNow,
      fileType,
      groupId: group
    });
    let errored = false;

    return new Promise(function(resolve, reject) {

      database
        .catch(function(error) {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          errored = true;
          reject(errorMessage);
        })
        .then(function (e) {
          const key = database.getKey();

          if (!errored) {
            resolve({'mssg':'success', key});
          }
        });
    });
  },
};
