
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
      }
    }
  };

  //  init
  siteObj.menu.init();
}());