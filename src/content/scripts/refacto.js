(function() {
  var $support, Refacto, _base, _base2, strings;
  var __hasProp = Object.prototype.hasOwnProperty;
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';
  const DEFAULT_KEY_BINDING = 'Alt+Return';
  $support = (_base = ((_base2 = (this.extensions || (this.extensions = {}))).refacto || (_base2.refacto = {}))).support || (_base.support = {});
  strings = Cc['@mozilla.org/intl/stringbundle;1'].getService(Ci.nsIStringBundleService).createBundle('chrome://refacto/locale/refacto.properties');
  this.extensions.refacto.Refacto = (function() {
    Refacto = (function() {
      function Refacto() {
        if (!(this instanceof Refacto)) {
          return (function(func, args, ctor) {
            ctor.prototype = func.prototype;
            var child = new ctor, result = func.apply(child, args);
            return typeof result === "object" ? result : child;
          })(Refacto, arguments, function() {});
        }
        this.assignDefaultKey();
        return this;
      }
      return Refacto;
    })();
    Refacto.prototype.assignDefaultKey = function() {
      var commandName, existingKeyBindings, isMac, keySequence, usedBy;
      isMac = ~navigator.platform.indexOf('Mac');
      try {
        existingKeyBindings = gKeybindingMgr.command2keysequences(commandName = 'cmd_refacto_triggerAtPosition');
        if (!existingKeyBindings.length) {
          keySequence = DEFAULT_KEY_BINDING;
          if (isMac) {
            keySequence = keySequence.replace(/\bCtrl\b/g, 'Meta');
          }
          keySequence = keySequence.split(',').map(function(key) {
            return key.replace(/^\s+|\s+$/, '');
          });
          usedBy = gKeybindingMgr.usedBy(keySequence);
          if (!usedBy.length || (usedBy.length === 1 && usedBy[0].command === 'cmd_editProperties')) {
            if (usedBy.length) {
              gKeybindingMgr.clearBinding(usedBy[0].command);
            }
            gKeybindingMgr.assignKey(commandName, keySequence);
            gKeybindingMgr.makeKeyActive(commandName, keySequence);
          }
        }
      } catch (error) {
        ko.dialogs.alert(strings.GetStringFromName('uncaughtError'), error.toString());
      }
      return undefined;
    };
    Refacto.showAvailable = function(view, features, menu) {
      var _len, feature, index, menuAnchor, menuPosition, scimoz;
      features.map(function(feature) {
        return feature.title = feature.title.replace(/\$\{(\w+)\}/g, function(match, key) {
          return feature.options[key];
        });
      });
      features.sort(function(left, right) {
        if (left.title < right.title) {
          return -1;
        }
        if (left.title > right.title) {
          return 1;
        }
        return 0;
      });
      menu || (menu = {});
      if (menu.parent) {
        menu.parent.removeAttribute('disabled');
      }
      if (!menu.element) {
        menu.element = document.getElementById(menu.id = 'refacto_features_menu');
        if (!menu.element) {
          menu.element = document.createElementNS(XUL_NS, 'menupopup');
          menu.element.id = menu.id;
          document.documentElement.appendChild(menu.element);
        }
      }
      while (menu.element.firstChild) {
        menu.element.removeChild(menu.element.firstChild);
      }
      scimoz = view.scimoz;
      for (index = 0, _len = features.length; index < _len; index++) {
        feature = features[index];
        (function(feature, index) {
          var itemAccessKey, itemElement;
          itemElement = document.createElementNS(XUL_NS, 'menuitem');
          if (index < 9) {
            itemAccessKey = index + 1;
          } else if (index === 9) {
            itemAccessKey = 0;
          } else {
            itemAccessKey = String.fromCharCode('A'.charCodeAt(0) + (index - 9));
          }
          itemElement.setAttribute('class', 'menuitem-iconic refacto-feature');
          itemElement.setAttribute('label', feature.title);
          itemElement.setAttribute('accesskey', itemAccessKey);
          itemElement.addEventListener('command', function() {
            view.setFocus();
            try {
              scimoz.beginUndoAction();
              return feature.klass.execute(scimoz, feature.options);
            } catch (error) {
              return ko.dialogs.alert(strings.GetStringFromName('uncaughtError'), error.toString());
            } finally {
              scimoz.endUndoAction();
            }
          }, false);
          return menu.element.appendChild(itemElement);
        })(feature, index);
      }
      if (!menu.visible) {
        menuAnchor = Math.min(scimoz.anchor, scimoz.currentPos);
        menuPosition = Math.max(scimoz.anchor, scimoz.currentPos);
        menu.element.openPopupAtScreen(view.boxObject.screenX + scimoz.pointXFromPosition(menuAnchor) - 1, view.boxObject.screenY + scimoz.pointYFromPosition(menuPosition) + scimoz.textHeight(scimoz.lineFromPosition(menuPosition) - 1), true);
        window.setTimeout(function() {
          var bubbles, cancelable, event, type, viewArg;
          event = document.createEvent('KeyEvents');
          event.initKeyEvent(type = 'keypress', bubbles = false, cancelable = false, viewArg = null, false, false, false, false, KeyEvent.DOM_VK_DOWN, null);
          return menu.element.dispatchEvent(event);
        }, 125);
      }
      return undefined;
    };
    Refacto.triggerAtPosition = function(menu) {
      var _i, _len, _ref, _ref2, _ref3, _ref4, _ref5, document, exit, feature, features, klass, language, options, prevAnchor, prevPosition, scimoz, view;
      exit = function(result) {
        if (menu != null ? menu.parent : undefined) {
          menu.parent.setAttribute('disabled', true);
        } else {
          ko.statusBar.AddMessage(strings.GetStringFromName('noFeaturesAvailable'), 'htmltoolkit', 2500, true);
        }
        return result;
      };
      if (!(view = (_ref = ko.views.manager) != null ? _ref.currentView : undefined)) {
        return exit(false);
      }
      if (view.getAttribute('type') !== 'editor') {
        return exit(false);
      }
      if (!((document = view.document) && (scimoz = view.scimoz))) {
        return exit(false);
      }
      features = [];
      _ref2 = [document.language].concat(document.language === document.subLanguage ? [] : [document.subLanguage]);
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        language = _ref2[_i];
        if (!$support[language]) {
          continue;
        }
        for (feature in _ref3 = $support[language]) {
          if (!__hasProp.call(_ref3, feature)) continue;
          klass = _ref3[feature];
          try {
            options = {};
            _ref4 = [scimoz.currentPos, scimoz.anchor], prevPosition = _ref4[0], prevAnchor = _ref4[1];
            if (!(options = klass.canExecute(scimoz))) {
              continue;
            }
            if (options === '__debug__') {
              break;
            }
          } finally {
            if (options !== '__debug__') {
              _ref5 = [prevPosition, prevAnchor], scimoz.currentPos = _ref5[0], scimoz.anchor = _ref5[1];
            }
          }
          features.push({
            klass: klass,
            title: klass.title,
            options: options
          });
        }
      }
      if (!features.length) {
        return exit(false);
      }
      return Refacto.showAvailable(view, features, menu);
    };
    return Refacto;
  }).call(this);
}).call(this);
