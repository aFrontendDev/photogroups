
var siteObj = siteObj ? siteObj : {};
(function() {
  'use strict';

  siteObj.globals = {
    user: null,
    config: {
      apiKey: "AIzaSyALZoArX2clXS6q3FoDjXfpefPm3bbGfnA",
      authDomain: "photogroups-4c0ba.firebaseapp.com",
      databaseURL: "https://photogroups-4c0ba.firebaseio.com",
      projectId: "photogroups-4c0ba",
      storageBucket: "photogroups-4c0ba.appspot.com",
      messagingSenderId: "959482757186"
    },
    _Html: document.querySelector('html'),
    // webserviceUrl: 'http://photogroups.192.168.0.3.xip.io:4000',
    webserviceUrl: 'http://127.0.0.1:4000',
    // groupsUrl: 'http://photogroups.192.168.0.3.xip.io/group',
    groupsUrl: 'http://localhost:8080/group.html',
    validationErrorClass: 'validation-errors',
    groupId: null,
    maxFilesize: 10 * 1024 * 1024,
    loggedInEvents() {
      const self = this;

      siteObj.createGroup.enableBtn();
      siteObj.showGroups.getGroups();
      siteObj.joinGroup.init();
    },
    loggedOutEvents() {
      const self = this;

      siteObj.createGroup.disableBtn();
    }
  };

  siteObj.menu = {
    _MenuAction: null,
    menuInClass: 'menu-in',
    init() {
      const self = this;
      
      self._MenuAction = document.querySelector('.menu-action');
      if (!self._MenuAction) {
        return;
      }

      self.bindEvents();
    },
    bindEvents() {
      const self = this;

      self._MenuAction.addEventListener('click', self.menuEventHandler);
    },
    menuEventHandler(e) {
      const self = siteObj.menu;

      const isMenuIn = document.body.classList.contains(self.menuInClass);
      if (isMenuIn) {
        document.body.classList.remove(self.menuInClass);
      } else {
        document.body.classList.add(self.menuInClass);
        document.body.classList.remove(siteObj.userActions.menuInClass);
      }
    }
  };

  siteObj.associateTables = {
    associateImgToUser(imageData, imageKey) {
      const self = this;

      fetch(`${siteObj.globals.webserviceUrl}/ImgToUser`, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({
          imageKey,
          group: imageData.groupId,
          user: imageData.userId,
          fileType: imageData.fileType,
          imageName: imageData.name
        })
      })
        .then(res => {
          // console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
    },
    associateImgToGroup(imageData, imageKey) {
      const self = this;

      fetch(`${siteObj.globals.webserviceUrl}/ImgToGroup`, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({
          imageKey,
          group: imageData.groupId,
          user: imageData.userId,
          fileType: imageData.fileType,
          imageName: imageData.name
        })
      })
        .then(res => {
          // console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
    },
    associateGroupToUser(userId, groupId, groupName) {
      const self = this;

      fetch(`${siteObj.globals.webserviceUrl}/GroupToUser`, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({
          groupId,
          userId,
          groupName
        })
      })
        .then(res => {

          res.json()
            .catch(err => {
              console.log(err);
            })
            .then(resJson => {
              siteObj.showGroups.getGroups();
            });
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  siteObj.createGroup = {
    inClass: 'create-group-in',
    showClass: 'create-group-show',
    _CreateGroupModalAction: null,
    _CreateGroupModal: null,
    _CloseAction: null,
    _CreateForm: null,
    _Link: null,
    addGroupUrl: siteObj.globals.groupsUrl,
    init() {
      const self = this;

      self._CreateGroupModalAction = document.querySelector('.group-create-action');
      self._CreateGroupModal = document.querySelector('.create-group');

      if (!self._CreateGroupModalAction || !self._CreateGroupModal) {
        return;
      }

      self._Link = document.querySelector('.create-group__link-input');
      self.bindEvents();
    },
    bindEvents() {
      const self = this;

      self._CreateGroupModalAction.addEventListener('click', self.modalOpenHandler);

      self._CloseAction = document.querySelector('.create-group__close-action');
      if (self._CloseAction) {
        self._CloseAction.addEventListener('click', self.closeHandler);
      }

      self._CreateForm = document.querySelector('.create-group__form');
      if (self._CreateForm) {
        self._CreateForm.addEventListener('submit', self.createGroupHandler);
      }
    },
    createGroupHandler(e) {
      const self = siteObj.createGroup;
      e.preventDefault();

      const _Form = this;
      const _Input = _Form.querySelector('input[name="create-group-name"]');
      const _Action = _Form.querySelector('.create-group__action');
      const inputVal = _Input.value;

      if (_Form.classList.contains('form-processing')) {
        return;
      }

      if (!inputVal) {
        _Form.classList.add(siteObj.globals.validationErrorClass);
        return;
      }

      if (_Action) {
        _Action.setAttribute('disabled', 'disabled');
        _Action.classList.add('btn--disabled');
      }

      _Form.classList.add('form-processing');
      _Form.classList.add('loading');
      _Form.reset();

      self.addGroup(inputVal, _Form, _Action);
    },
    closeHandler() {
      const self = siteObj.createGroup;

      document.body.classList.remove(self.showClass);
      document.body.classList.remove(self.inClass);
    },
    modalOpenHandler() {
      const self = siteObj.createGroup;

      document.body.classList.add(self.inClass);
      document.body.classList.add(self.showClass);
      document.body.classList.remove(siteObj.menu.menuInClass);
    },
    enableBtn() {
      const self = this;

      if (self._CreateGroupModalAction) {
        self._CreateGroupModalAction.removeAttribute('disabled');
        self._CreateGroupModalAction.classList.remove('btn--disabled');
      }
    },
    disableBtn() {
      const self = this;

      if (self._CreateGroupModalAction) {
        self._CreateGroupModalAction.setAttribute('disabled', 'disabled');
        self._CreateGroupModalAction.classList.add('btn--disabled');
      }
    },
    addGroup(groupName, _Form, _Action) {
      const self = this;

      if (!groupName || !_Form) {
        return;
      }

      if (!siteObj.globals.user.uid) {
        return;
      }

      fetch(`${siteObj.globals.webserviceUrl}/addGroup`, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({
          groupName,
          user: siteObj.globals.user.uid
        })
      })
        .then(res => {
          const response = res;

          response.json()
            .then(resJson => {
              const key = resJson.key;

              if (_Action) {
                _Action.removeAttribute('disabled', 'disabled');
                _Action.classList.remove('btn--disabled');
              }

              _Form.classList.remove('form-processing');
              _Form.classList.remove('loading');

              if (response.status === 200) {
                siteObj.associateTables.associateGroupToUser(siteObj.globals.user.uid, key, groupName);
                const linkUrl = `${self.addGroupUrl}?groupid=${key}`;

                const linkTemplate = `<a href="${linkUrl}">${linkUrl}</a>`;
                const _LinkContainer = document.querySelector('.create-group__link');
                if (_LinkContainer) {
                  _LinkContainer.innerHTML = linkTemplate;
                }

                self._Link.value = linkUrl;
                siteObj.shareGroup.populateLinks(linkUrl);
                document.body.classList.add('group-created');
              }
            })
            .catch(err => {
              console.log(err);
              _Form.classList.remove('form-processing');
              _Form.classList.remove('loading');
              if (_Action) {
                _Action.removeAttribute('disabled', 'disabled');
                _Action.classList.remove('btn--disabled');
              }
            });
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  siteObj.shareGroup = {
    populateLinks(url) {
      const self = this;

      if (!url) {
        return;
      }

      const _Links = document.querySelectorAll('.share-group-link');
      if (!_Links || _Links.length < 1) {
        return;
      }


      for (const _Link of _Links) {
        const dataPlatform = _Link.getAttribute('data-share-platform');
        let href = null;

        switch(dataPlatform) {
          case 'facebook':
            href = `fb-messenger://share/?link=${url}&app_id=1018836631592625`;
            break;

          case 'whatsapp':
            href = `whatsapp://send?text=Hey! Join my new photo group at ${url}`;
            break;

          case 'email':
            href = `mailto:?subject=Hey! Join my new photo group&body=I've made a new photo group, join and add your pictures here: ${url}`;
            break;
        }

        if (!href) {
          return;
        }

        _Link.setAttribute('href', href);
        _Link.removeAttribute('disabled');
      }
    }
  };

  siteObj.joinGroup = {
    groupId: null,
    init() {
      const self = this;
      const groupId = siteObj.utilities.getUrlParams('groupid');

      if (!siteObj.globals.user) {
        return;
      }
  
      if (groupId) {
        siteObj.globals.groupId = groupId;
        self.groupId = groupId;
        self.joinGroup(groupId);
      }
    },
    joinGroup(groupId) {
      const self = this;

      if (!groupId) {
        return;
      }

      const _JoinGroup = document.querySelector('.join-group');
      const _Joined = document.querySelector('.join-group__joined');

      fetch(`${siteObj.globals.webserviceUrl}/getGroupInfo`, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({
          groupId
        })
      })
        .catch(err => {
          console.log(err);
        })
        .then(res => {
          res.json()
            .catch(err => {
              console.log(err);
            })
            .then(resJson => {

              fetch(`${siteObj.globals.webserviceUrl}/joinGroup`, {
                method: 'POST',
                headers: new Headers({
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                }),
                body: JSON.stringify({
                  groupId,
                  user: siteObj.globals.user.uid
                })
              })
                .then(res => {

                  if (res.status !== 200) {
                    return;
                  }

                  res.json()
                    .then(resJson => {
                      const groupName = resJson.groupName;

                      if (resJson.userexists) {
                        _JoinGroup.innerHTML = '';

                        // Show group images
                        siteObj.getGroupInfo.init(groupId);
                        return;
                      }
                      siteObj.associateTables.associateGroupToUser(siteObj.globals.user.uid, groupId, groupName);

                      _JoinGroup.classList.remove('loading');
                      _JoinGroup.classList.add('join-group--success');

                      // Show group images
                      siteObj.getGroupInfo.init(groupId);

                      setTimeout(() => {
                        _JoinGroup.innerHTML = '';
                      }, 1000);
                    })
                    .catch(err => {
                      console.log(err);
                      document.body.classList.add('join-group--fail');
                    });
                })
                .catch(err => {
                  console.log(err);
                });
            })
        })
    }
  };

  siteObj.getGroupInfo = {
    groupImages: {},
    _ImagesContainer: null,
    _Group: null,
    _GroupName: null,
    _GroupUserCount: null,
    init(groupId) {
      const self = this;

      if (!groupId) {
        return;
      }

      self._ImagesContainer = document.querySelector('.image-grid__images');
      if (!self._ImagesContainer) {
        return;
      }

      self._GroupName = document.querySelector('.group__title');
      self._Group = document.querySelector('.group');
      self._GroupUserCount = document.querySelector('.group__users');

      self.getGroupData(groupId);
    },
    getGroupData(groupId) {
      const self = this;

      if (!groupId) {
        return;
      }

      siteObj.getInfo.getGroupInfo(groupId)
        .catch(err => {
          console.log(err);
        })
        .then(res => {
          console.log(res);

          if (self._Group) {
            self._Group.classList.add('group--in');
          }

          if (res.Users) {
            self.updateUserCount(res.Users);
          }

          if (res.groupName) {
            self.addTitle(res.groupName);
          }

          if (res.Images) {
            self.groupImages = res.Images;
            self.getImages(groupId, res.Images);
          } else {
            const _NoImgs = document.createElement('p');
            _NoImgs.textContent = 'No images have been added yet';
            self._ImagesContainer.append(_NoImgs);
          }
        });
    },
    addTitle(name) {
      const self = this;

      if (self._GroupName && name) {
        self._GroupName.textContent = name;
      }
    },
    updateUserCount(users) {
      const self = this;

      if (self._GroupUserCount && users) {
        const count = Object.keys(users).length;
        if (count > 1) {
          self._GroupUserCount.textContent = `${count} members`;
        } else {
          self._GroupUserCount.textContent = `${count} member`;
        }
      }
    },
    getImages(groupId, images) {
      const self = this;

      if (!groupId || !images || images.length < 1) {
        return;
      }

      for (const image in images) {
        const fileType = images[image].fileType;
        const _Fig = document.createElement('figure');
        _Fig.classList.add('image-grid__figure');
        const svgTemplate = '<div class="image-grid__figure-target"></div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 8.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5zm9 .5l-2.519 4-2.481-1.96-4 5.96h14l-5-8zm8-4v14h-20v-14h20zm2-2h-24v18h24v-18z"/></svg>';
        _Fig.innerHTML = svgTemplate;

        if (fileType) {
          self._ImagesContainer.append(_Fig);

          siteObj.getInfo.getImageUrl(image, fileType)
            .then(res => {
              self.addImage(image, res, _Fig);
              // self.bindImgOpenEvent(_Fig);
            })
            .catch(err => {
              console.log(err);
            });
        }
      }
    },
    addImage(image, url, _Target) {
      const self = this;

      if (!image || !url || !_Target) {
        return;
      }

      const _ImageTarget = _Target.querySelector('.image-grid__figure-target');

      const imageTemplate = `
        <a href="${url}" data-image-id="${image}" class="image-grid__link image-grid__action" target="_blank" rel="noopener nofollow noreferrer">
          <img class="image-grid__image" src="${url}" alt="uploaded image" />
        </a>
      `;


      if (_ImageTarget) {
        _ImageTarget.innerHTML = imageTemplate;
      } else {
        _Target.innerHTML = imageTemplate;
      }

      imagesLoaded(_Target, () => {
        console.log('done');
        _Target.classList.add('image-in');
      });
    },
    addSingleImage(imageId, imageObj) {
      const self = this;

      if (!imageId || !imageObj) {
        return;
      }

      const fileType = imageObj.fileType;
      const _Fig = document.createElement('figure');
      _Fig.classList.add('image-grid__figure');

      if (!fileType) {
        return;
      }

      self._ImagesContainer.append(_Fig);
      siteObj.getInfo.getImageUrl(imageId, fileType)
        .then(res => {
          console.log(res);
          // we have the image so now we'll update our object of images;
          self.addImage(imageId, res, _Fig);
          // self.bindImgOpenEvent(_Fig);
          self.groupImages[imageId] = imageObj;
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  siteObj.uploadImg = {
    _Upload: null,
    _UploadForm: null,
    _ModalOpenAction: null,
    _ModalCloseAction: null,
    _Preview: null,
    _FileInput: null,
    _ProgressBar: null,
    _ProgressNum: null,
    modalInClass: 'image-upload-in',
    modalShowClass: 'image-upload-show',
    fileReader: null,
    init() {
      const self = this;

      self._Upload = document.querySelector('.image-upload');
      if (!self._Upload) {
        return;
      }

      self.fileReader = new FileReader;
      self._Preview = document.querySelector('.image-upload__preview');
      self._ProgressBar = document.querySelector('.image-upload__progress-bar');
      self._ProgressNum = document.querySelector('.image-upload__progress-num');
      self.bindEvents();
    },
    bindEvents() {
      const self = this;

      self._ModalOpenAction = document.querySelector('.image-upload-open-action');
      if (self._ModalOpenAction) {
        self._ModalOpenAction.addEventListener('click', self.openModal);
      }

      self._ModalCloseAction = document.querySelector('.image-upload__close-action');
      if (self._ModalCloseAction) {
        self._ModalCloseAction.addEventListener('click', self.closeModal);
      }

      self._UploadForm = document.querySelector('.image-upload__form');
      if (self._UploadForm) {
        self._UploadForm.addEventListener('submit', self.uploadEvent);
      }

      if (self._Preview) {
        self._FileInput = document.querySelector('input[name="upload-input"]');
        if (self._FileInput) {
          self._FileInput.addEventListener('change', function(){
            const file = this.files ? this.files[0] : null;
            if (file) {
              // trigger preview image
              self.fileReader.readAsDataURL(file);
            }
          });
        }

        self.fileReader.addEventListener('load', self.showPreview);
      }
    },
    showPreview(e) {
      const self = siteObj.uploadImg;

      const image = e.target.result;
      if (image) {
        const imageTemplate = `<img src="${image}" class="image-upload__preview-img" alt="preview image" />`;
        self._Preview.innerHTML = imageTemplate;
      }
    },
    openModal() {
      const self = siteObj.uploadImg;

      document.body.classList.add(self.modalInClass);
      document.body.classList.add(self.modalShowClass);
    },
    closeModal() {
      const self = siteObj.uploadImg;

      document.body.classList.remove(self.modalShowClass);
      document.body.classList.remove(self.modalInClass);
    },
    uploadEvent(e) {
      e.preventDefault();
      const self = siteObj.uploadImg;
      const _Form = this;

      const _Name = _Form.querySelector('.image-upload__name');
      const _FileInput = _Form.querySelector('.image-upload__file');
      const nameVal = _Name.value;
      let responseJson = null;
      const group = siteObj.globals.groupId ? siteObj.globals.groupId : null;
      const file = _FileInput.files[0];
      const fileTypeSplit = file.type.split('/');
      const fileSize = file.size;
      
      if (fileTypeSplit[0] !== 'image') {
        // TODO add message to user
        return;
      }

      if (fileSize > siteObj.globals.maxFilesize) {
        console.log('file too big');
        return;
      }

      if (!group) {
        return;
      }

      const imageData = {
        name: nameVal,
        file,
        fileType: fileTypeSplit[1],
        groupId: group,
        userId: siteObj.globals.user.uid
      };

      // update DB entries and then when done actually upload the image to the storage db with relevant meta data
      // This first call will upload to the image db (not the storage for the actual image, just a ref to it)
      fetch(`${siteObj.globals.webserviceUrl}/imageUpload`, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({
          name: nameVal,
          fileType: fileTypeSplit[1],
          group,
          userId: siteObj.globals.user.uid,
          userName: siteObj.globals.user.displayName
        })
      })
        .then(res => {
          // now we've added an entry to the image db and have a unique key. We'll upload the image to the storage db
          const response = res;
          response.json()
            .then(resJson => {
              const imageKey = resJson.key;
              const userId = siteObj.globals.user.uid;

              if (response.status === 200) {
                self.uploadImg(imageData, imageKey);
                siteObj.associateTables.associateImgToUser(imageData, imageKey);
                siteObj.associateTables.associateImgToGroup(imageData, imageKey);
              }
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
    },
    uploadImg(imageData, imageKey) {
      const self = this;
      const storageRef = firebase.storage().ref();

      const metadata = {
        contentType: imageData.fileType,
        customMetadata: {
          relatedKey: imageKey,
          userId: imageData.userId,
          imageName: imageData.name,
          groupId: imageData.groupId
        }
      };

      const uploadTask = storageRef.child(`images/${imageKey}.${imageData.fileType}`).put(imageData.file, metadata);
      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function(snapshot) {
          let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          if (self._ProgressBar) {
            self._ProgressBar.value = progress;
          }

          if (self._ProgressNum) {
            self._ProgressNum.textContent = `${progress}%`;
          }
        }, function(error) {
          console.log(error);
          const _Error = document.querySelector('.image-upload__error');
          if (_Error) {
            _Error.textContent = error.code;
          }
      }, function() {
        // Upload completed successfully, now we can get the download URL
        const downloadURL = uploadTask.snapshot.downloadURL;
        self.closeModal();

        console.log(imageKey);
        fetch(`${siteObj.globals.webserviceUrl}/broadcastImgUpload`, {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
          body: JSON.stringify({
            imageKey,
          })
        })
          .catch(err => {
            console.log(err);
          });
      });
    }
  };

  siteObj.userActions = {
    _UserMenuAction: null,
    _GoogleAction: null,
    _FacebookAction: null,
    _RegisterForm: null,
    _SignoutAction: null,
    _LoginCustomForm: null,
    menuInClass: 'user-menu-in',
    loggedInClass: 'logged-in',
    init() {
      const self = this;

      firebase.initializeApp(siteObj.globals.config);

      self._UserMenuAction = document.querySelector('.login-register-action');
      if (!self._UserMenuAction) {
        return;
      }

      self.bindEvents();
    },
    bindEvents() {
      const self = this;

      self._UserMenuAction.addEventListener('click', self.userActionHandler);

      self._GoogleAction = document.querySelector('.login__google');
      if (self._GoogleAction) {
        self._GoogleAction.addEventListener('click', self.googleSigninHandler);
      }

      self._FacebookAction = document.querySelector('.login__facebook');
      if (self._FacebookAction) {
        self._FacebookAction.addEventListener('click', self.facebookSigninHandler);
      }

      self._SignoutAction = document.querySelector('.logout-action');
      if (self._SignoutAction) {
        self._SignoutAction.addEventListener('click', self.signoutHandler);
      }

      self._RegisterForm = document.querySelector('.register__custom');
      if (self._RegisterForm) {
        self._RegisterForm.addEventListener('submit', self.registerHandler);
      }

      self._LoginCustomForm = document.querySelector('.login__custom');
      if (self._LoginCustomForm) {
        self._LoginCustomForm.addEventListener('submit', self.loginFormHandler);
      }


      // google auth actions - listen for user sign-in
      firebase.auth().onAuthStateChanged((user) => {
        console.log('user changed');
        if (user) {
          self.userSignedIn(user);
        }
      });
    },
    userSignedIn(user) {
      const self = this;

      if (!user) {
        return;
      }

      const displayName = user.displayName;
      const _Username = document.querySelector('.username');
      if (_Username && displayName) {
        _Username.textContent = `(${displayName})`;
      }

      siteObj.globals.user = user;
      document.body.classList.add(self.loggedInClass);
      siteObj.globals.loggedInEvents();
      const isNewUser = window.localStorage.getItem('newUser');
      if (isNewUser) {
        window.localStorage.removeItem('newUser');
        self.addUser(user.uid, user.displayName, user.email);
      }
    },
    signoutHandler() {
      const self = siteObj.userActions;

      firebase.auth().signOut()
        .then(function() {
          siteObj.globals.user = null;
          document.body.classList.remove(self.loggedInClass);
          siteObj.globals.loggedOutEvents();
        })
        .catch(function(error) {
          // An error happened.
          console.log(error);
        });
    },
    registerHandler(e) {
      const self = siteObj.userActions;
      e.preventDefault();

      let emptyField = false;
      let emailVal = null;
      let passwordVal = null;
      let firstnameVal = null;
      let lastnameVal = null;

      const _Form = this;
      const _Inputs = _Form.querySelectorAll('input');
      if (!_Inputs || _Inputs.length < 1) {
        return;
      }

      for (const _Input of _Inputs) {
        const val = _Input.value;
        if (!val || val.length < 1) {
          emptyField = true;
        }

        switch(_Input.name) {
          case 'register-email':
            emailVal = val;
            break;
          case 'register-password':
            passwordVal = val;
            break;
          case 'register-firstname':
            firstnameVal = val;
            break;
          case 'register-lastname':
            lastnameVal = val;
            break;
          default:
            console.log('not matched expected fields');
            break;
        }
      }

      if (emptyField) {
        console.log('empty fields');
        _Form.classList.add(siteObj.globals.validationErrorClass);
        return;
      }
      _Form.classList.remove(siteObj.globals.validationErrorClass);
      _Form.classList.add('loading');

      firebase.auth().createUserWithEmailAndPassword(emailVal, passwordVal)
        .then(user => {

          user.updateProfile({
            displayName: `${firstnameVal} ${lastnameVal}`
          })
            .then(() => {
              firebase.auth().signInWithEmailAndPassword(emailVal, passwordVal)
                .then((user) => {
                  _Form.reset();
                  _Form.classList.remove('loading');
                  document.body.classList.remove(self.menuInClass);
                  self.addUser(user.uid, user.displayName, user.email);
                })
                .catch(err => {
                  console.log(err);
                  _Form.classList.remove('loading');
                });
            })
            .catch(err => {
              console.log(err);
              _Form.classList.remove('loading');
            });
        })
        .catch(err => {
          console.log(err);
          _Form.classList.remove('loading');
        });
    },
    facebookSigninHandler() {
      const self = siteObj.userActions;
      const provider = new firebase.auth.FacebookAuthProvider();
      window.localStorage.setItem('newUser', true);

      firebase.auth().signInWithRedirect(provider)
        .catch(err => {
          console.log(err);
        });
    },
    googleSigninHandler() {
      const self = siteObj.userActions;
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

      window.localStorage.setItem('newUser', true);
      firebase.auth().signInWithRedirect(provider)
        .catch(err => {
          console.log(err);
        });
    },
    loginFormHandler(e) {
      const self = siteObj.userActions;
      e.preventDefault();

      let emptyField = false;
      let emailVal = null;
      let passwordVal = null;

      const _Form = this;
      const _Inputs = _Form.querySelectorAll('input');
      if (!_Inputs || _Inputs.length < 1) {
        return;
      }

      for (const _Input of _Inputs) {
        const val = _Input.value;
        if (!val || val.length < 1) {
          emptyField = true;
        }

        switch(_Input.name) {
          case 'login-email':
            emailVal = val;
            break;
          case 'login-password':
            passwordVal = val;
            break;
          default:
            console.log('not matched expected fields');
            break;
        }
      }

      if (emptyField) {
        console.log('empty fields');
        _Form.classList.add(siteObj.globals.validationErrorClass);
        return;
      }
      _Form.classList.remove(siteObj.globals.validationErrorClass);

      self.signInCustom(_Form, emailVal, passwordVal);
    },
    userActionHandler(e) {
      const self = siteObj.userActions;

      const isUserMenuIn = document.body.classList.contains(self.menuInClass);
      if (isUserMenuIn) {
        document.body.classList.remove(self.menuInClass);
      } else {
        document.body.classList.add(self.menuInClass);
        document.body.classList.remove(siteObj.menu.menuInClass);
      }
    },
    addUser(userId, name, email) {
      const self = this;

      if (!userId || !name || !email) {
        return;
      }

      fetch(`${siteObj.globals.webserviceUrl}/addUser`, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({
          user: userId,
          name,
          email
        })
      })
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
        });
    },
    signInCustom(_Form, email, password) {
      const self = this;

      if (!_Form || !email || !password) {
        return;
      }

      firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
          _Form.reset();
          document.body.classList.remove(self.menuInClass);
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  siteObj.showGroups = {
    _Groups: null,
    _GroupsList: null,
    groups: null,
    init() {
      const self = this;

      self._Groups = document.querySelector('.groups-listing');
      if (!self._Groups) {
        return;
      }
      
      self._GroupsList = self._Groups.querySelector('.groups-listing__list');
    },
    getGroups() {
      const self = this;

      siteObj.getInfo.getGroups()
        .then(res => {
          self.populateGroupsList(res);
        })
        .catch(err => {
          console.log(err);
        });
    },
    populateGroupsList(groups) {
      const self = this;

      if (!groups || groups.length < 1) {
        return;
      }

      self._GroupsList.innerHTML = '';
      for (const group of groups) {
        const _Li = document.createElement('li');
        _Li.classList.add('groups-listing__item');
        _Li.classList.add('menu__item');

        const anchorTemplate = `
          <a href="${siteObj.globals.groupsUrl}?groupid=${group.id}" class="menu__link">${group.val}</a>
        `;

        _Li.innerHTML = anchorTemplate;
        self._GroupsList.append(_Li);
      }
    }
  }

  siteObj.getInfo = {
    groups: null,
    getGroups() {
      const self = this;

      return new Promise(function(resolve, reject) {

        fetch(`${siteObj.globals.webserviceUrl}/getGroups`, {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
          body: JSON.stringify({
            userId: siteObj.globals.user.uid
          })
        })
          .then(res => {
            res.json()
              .then(resJson => {
                self.groups = resJson.groups;
                resolve(resJson.groups);
              })
              .catch(err => {
                console.log(err);
                reject(err);
              })
          })
          .catch(err => {
            console.log(err);
            reject(err);
          });
      });
    },
    getImageInfo(id) {
      const self = this;

      if (!id) {
        return;
      }

      return new Promise(function(resolve, reject) {
        
        fetch(`${siteObj.globals.webserviceUrl}/getImageInfo`, {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
          body: JSON.stringify({
            imageId: id
          })
        })
          .then(res => {
            res.json()
              .then(resJson => {
                // console.log(resJson);
                resolve(resJson.data);
              })
              .catch(err => {
                console.log(err);
                reject(err);
              })
          })
          .catch(err => {
            console.log(err);
            reject(err);
          });
      });
    },
    getImageUrl(imageId, fileType) {
      const self = this;
      const storageRef = firebase.storage().ref();

      if (!imageId || !fileType) {
        return;
      }

      return new Promise(function(resolve, reject) {

        const imageStoragePath = storageRef.child(`/images/${imageId}.${fileType}`);

        imageStoragePath.getDownloadURL()
          .then(url => {
            resolve(url);
          })
          .catch(err => {
            console.log(err);
            reject(err);
          });
      });
    },
    getGroupInfo(groupId) {
      const self = this;

      if (!groupId) {
        return;
      }

      return new Promise(function(resolve, reject) {

        fetch(`${siteObj.globals.webserviceUrl}/getGroupInfo`, {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
          body: JSON.stringify({
            groupId
          })
        })
          .catch(err => {
            console.log(err);
            reject(err);
          })
          .then(res => {
            res.json()
              .catch(err => {
                console.log(err);
                reject(err);
              })
              .then(resJson => {
                resolve(resJson.data);
              });
          });
      });
    }
  };

  siteObj.websocket = {
    socket: null,
    mssgTime: 0,
    init() {
      const self = this;

      self.socket = new WebSocket('ws://localhost:4500');
      self.bindEvents();
    },
    bindEvents() {
      const self = this;

      // Connection opened
      self.socket.addEventListener('open', function (event) {
        console.log('socket open');

        // Listen for messages
        self.socket.onmessage = function (event) {
          console.log('socket message');
          console.log(event);
          
          // arbitrary delay as I seemed to be getting hammered with pointless updates (probably doing something wrong)
          if (event.timeStamp - self.mssgTime < 100) {
            return;
          }

          self.mssgTime = event.timeStamp;
          let jsonData = null;
          try {
            jsonData = JSON.parse(event.data);

            if (jsonData.update === 'imageUpdated') {
              // siteObj.showGroup.updateModalImg(jsonData);
            }

            if (jsonData.update === 'new image') {
              console.log(jsonData);
              self.findNewImages(jsonData);
            }
          } catch(err) {
            console.log(err);
          }
        };
      });
    },
    watchGroupImage(groupId, imageId) {
      const self = this;

      if (!groupId || !imageId) {
        return;
      }

      fetch(`${siteObj.globals.webserviceUrl}/watchGroupImage`, {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify({
          groupId,
          imageId
        })
      })
        .catch(err => {
          console.log(err);
        });
    },
    findNewImages(imagesObject) {
      const self = this;

      if (!imagesObject) {
        return;
      }

      
      for (const item in imagesObject) {
        // const existingImages = Object.keys(siteObj.getGroupInfo.groupImages).length;
        const existingImages = siteObj.getGroupInfo.groupImages;
        const imageId = item;
        const imageObject = imagesObject[imageId];

        if (imageId !== 'update') {
          // if (existingImages < 1) {
          //   siteObj.getGroupInfo.groupImages[imageId] = imageObject;
          // }

          if (!existingImages[item]) {
            siteObj.getGroupInfo.addSingleImage(imageId, imageObject);
          }
        }
      }
    }
  };

  siteObj.copyToClipboard = {
    _CopyBtns: null,
    init() {
      const self = this;

      self._CopyBtns = null;
      self._CopyBtns = document.querySelectorAll('.copy-to-clipboard-action');
      if (!self._CopyBtns || self._CopyBtns.length < 1) {
        return;
      }

      self.bindEvents();
    },
    bindEvents() {
      const self = this;

      for (const _CopyBtn of self._CopyBtns) {
        _CopyBtn.removeEventListener('click', self.copyBtnHandler);
        _CopyBtn.addEventListener('click', self.copyBtnHandler);
      }
    },
    copyBtnHandler(e) {
      const self = siteObj.copyToClipboard;

      const dataTarget = this.getAttribute('data-target');
      const dataMessageTarget = this.getAttribute('data-completion-message-target');
      const dataMessage = this.getAttribute('data-success-message');

      const _MessageTarget = document.querySelector(dataMessageTarget);
      if (!dataTarget || dataTarget.length < 1) {
        return;
      }

      const _Target = document.querySelector(dataTarget);
      if (!_Target) {
        return;
      }


      _Target.select();
      const copied = document.execCommand('copy');

      if (copied && _MessageTarget) {
        _MessageTarget.textContent = dataMessage ? dataMessage : "Link copied";
      }
    }
  };

  siteObj.utilities = {
    getUrlParams(parameter) {
      const self = this;
      let queryString = window.location.search;

      if (queryString !== undefined) {
        queryString = window.location.search.replace('?', '');

        let params = {},
          queryStringArray = queryString.split('&');

        for (const index in queryStringArray) {
          const query = queryStringArray[index].split('=');

          params[decodeURIComponent(query[0])] = decodeURIComponent(query[1]);
        }

        if (parameter) {
          return params[parameter];
        } else {
          return params;
        }
      }
    },
    checkUserAgent() {
      const self = this;
      const isAndroid = navigator.userAgent.match(/(Android)/) ? true : false;
      const isIpad = navigator.userAgent.match(/iPad/i) ? true : false;
      const isIphone = navigator.userAgent.match(/iPhone/i) ? true : false;
      const isIos = isIpad || isIphone ? true : false;
      
      if (isAndroid) {
        siteObj.globals._Html.classList.add('android');
      }

      if (isIos) {
        siteObj.globals._Html.classList.add('ios');
      }
    },
  };

  //  init
  siteObj.menu.init();
  siteObj.userActions.init();
  siteObj.createGroup.init();
  siteObj.copyToClipboard.init();
  siteObj.utilities.checkUserAgent();
  siteObj.showGroups.init();
  siteObj.uploadImg.init();
  siteObj.websocket.init();
}());