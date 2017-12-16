
var siteObj = siteObj ? siteObj : {};
(function() {
  'use strict';

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

  siteObj.userActions = {
    _UserMenuAction: null,
    menuInClass: 'user-menu-in',
    init() {
      const self = this;

      self._UserMenuAction = document.querySelector('.login-register-action');
      if (!self._UserMenuAction) {
        return;
      }

      self.bindEvents();
    },
    bindEvents() {
      const self = this;

      self._UserMenuAction.addEventListener('click', self.userActionHandler);
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
    }
  }

  //  init
  siteObj.menu.init();
  siteObj.userActions.init();
}());