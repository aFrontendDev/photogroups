
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

  siteObj.createGroup = {
    _CreateGroupAction: null,
    init() {
      const self = this;

      self._CreateGroupAction = document.querySelector('.group-create-action');
    },
    bindEvents() {
      const self = this;
    },
    enableBtn() {
      const self = this;

      if (self._CreateGroupAction) {
        self._CreateGroupAction.removeAttribute('disabled');
        self._CreateGroupAction.classList.remove('btn--disabled');
      }
    },
    disableBtn() {
      const self = this;

      if (self._CreateGroupAction) {
        self._CreateGroupAction.setAttribute('disabled', 'disabled');
        self._CreateGroupAction.classList.add('btn--disabled');
      }
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

      let href = null;

      for (const _Link of _Links) {
        const dataPlatform = _Link.getAttribute('data-share-platform');

        switch(dataPlatform) {
          case 'facebook':
            href = `http://www.facebook.com/dialog/send?app_id=1018836631592625&link=${url}`;
            break;
          
          case 'whatsapp':
            href = `whatsapp://send?text=Hey! Join my new photo group at ${url}`;
            break;
          
          case 'email':
            href = `mailto:?subject=Hey! Join my new photo group&body=I've made a new photo group, join and add your pictures here: ${url}`;
            break;
        }
      }

      if (!href) {
        return;
      }

      _Link.setAttribute('href', href);
      _Link.removeAttribute('disabled');
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
    validationErrorClass: 'validation-errors',
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
        _Form.classList.add(self.validationErrorClass);
        return;
      }
      _Form.classList.remove(self.validationErrorClass);

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
        _Form.classList.add(self.validationErrorClass);
        return;
      }
      _Form.classList.remove(self.validationErrorClass);

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

      fetch('http://127.0.0.1:4000/addUser', {
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
  }

  //  init
  siteObj.menu.init();
  siteObj.userActions.init();
  siteObj.createGroup.init();
}());