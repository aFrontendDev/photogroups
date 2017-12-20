
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
    webserviceUrl: 'http://photogroups.192.168.0.3.xip.io',
    validationErrorClass: 'validation-errors',
    loggedInEvents() {
      const self = this;

      siteObj.createGroup.enableBtn();
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

      fetch(`${siteObj.globals.webserviceUrl}:4000/ImgToUser`, {
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

      fetch(`${siteObj.globals.webserviceUrl}:4000/ImgToGroup`, {
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

      fetch(`${siteObj.globals.webserviceUrl}:4000/GroupToUser`, {
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
              console.log('group added');
              console.log(resJson);
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
    addGroupUrl: 'http://localhost:8080/group.html',
    init() {
      const self = this;

      self._CreateGroupModalAction = document.querySelector('.group-create-action');
      self._CreateGroupModal = document.querySelector('.create-group');

      if (!self._CreateGroupModalAction || !self._CreateGroupModal) {
        return;
      }

      self._Link = document.querySelector('.create-group__link');
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
      const inputVal = _Input.value;

      if (!inputVal) {
        _Form.classList.add(siteObj.globals.validationErrorClass);
        return;
      }

      self.addGroup(inputVal);
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
    addGroup(groupName) {
      const self = this;

      if (!groupName) {
        return;
      }

      if (!siteObj.globals.user.uid) {
        return;
      }

      fetch(`${siteObj.globals.webserviceUrl}:4000/addGroup`, {
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
            siteObj.associateTables.associateGroupToUser(siteObj.globals.user.uid, key, groupName);

              if (response.status === 200) {
                const linkUrl = `${self.addGroupUrl}?groupid=${key}`;
                self._Link.value = linkUrl;
                siteObj.shareGroup.populateLinks(linkUrl);
                document.body.classList.add('group-created');
              }
            })
            .catch(err => {
              console.log(err);
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

      firebase.auth().createUserWithEmailAndPassword(emailVal, passwordVal)
        .then(user => {

          user.updateProfile({
            displayName: `${firstnameVal} ${lastnameVal}`
          })
            .then(() => {
              firebase.auth().signInWithEmailAndPassword(emailVal, passwordVal)
                .then((user) => {
                  _Form.reset();
                  document.body.classList.remove(self.menuInClass);
                  self.addUser(user.uid, user.displayName, user.email);
                })
                .catch(err => {
                  console.log(err);
                });
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
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

      fetch(`${siteObj.globals.webserviceUrl}:4000/addUser`, {
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
  
}());