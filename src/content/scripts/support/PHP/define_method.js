(function() {
  var $support, _base, _base2, strings;
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  $support = (_base = ((_base2 = (this.extensions || (this.extensions = {}))).refacto || (_base2.refacto = {}))).support || (_base.support = {});
  $support.PHP || ($support.PHP = {});
  strings = Cc['@mozilla.org/intl/stringbundle;1'].getService(Ci.nsIStringBundleService).createBundle('chrome://refacto/locale/refacto.properties');
  $support.PHP.defineMethod = {
    title: strings.GetStringFromName('PHP.defineMethod'),
    canExecute: function(scimoz) {
      if (!$support.walk(scimoz, 'after', [['SSL_IDENTIFIER', 'SSL_DEFAULT'], ['(', 'SSL_DEFAULT']])) {
        return false;
      }
      if (!$support.walk(scimoz, 'before', [['(', 'SSL_DEFAULT']])) {
        return false;
      }
      $support.walk(scimoz, 'after', [['SSL_DEFAULT']], {
        keep: true
      });
      if (!$support.walk(scimoz, 'before', [['(', 'SSL_DEFAULT'], ['SSL_IDENTIFIER', 'SSL_DEFAULT'], ['-', '>', 'SSL_DEFAULT'], ['SSL_VARIABLE', 'SSL_DEFAULT']])) {
        return false;
      }
      $support.walk(scimoz, 'after', [['SSL_DEFAULT']], {
        keep: true
      });
      if ($support.under(scimoz) !== '$this') {
        return false;
      }
      if (!$support.walk(scimoz, 'after', [['SSL_VARIABLE', 'SSL_DEFAULT'], ['-', '>', 'SSL_DEFAULT'], ['SSL_IDENTIFIER', 'SSL_DEFAULT']])) {
        return false;
      }
      $support.walk(scimoz, 'before', [['SSL_DEFAULT']], {
        keep: true
      });
      return {
        identifier: $support.under(scimoz)
      };
    },
    execute: function(scimoz, options) {
      var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, anchor, before, classFound, position, prevAnchor, prevPosition, safeGuard;
      _ref = [null, null], prevPosition = _ref[0], prevAnchor = _ref[1];
      safeGuard = 0;
      classFound = false;
      while (++safeGuard < 20 && (prevPosition !== scimoz.currentPos || prevAnchor !== scimoz.anchor)) {
        _ref2 = [scimoz.currentPos, scimoz.anchor], prevPosition = _ref2[0], prevAnchor = _ref2[1];
        $support.expandBlock();
        _ref3 = [scimoz.currentPos, scimoz.anchor], position = _ref3[0], anchor = _ref3[1];
        try {
          before = $support.walk(scimoz, 'before', [['{', 'SSL_DEFAULT'], ['\\', 'SSL_IDENTIFIER', 'SSL_WORD', 'SSL_DEFAULT']]);
          if (before) {
            $support.walk(scimoz, 'after', [['SSL_DEFAULT']], {
              keep: true
            });
            if ((_ref4 = $support.under(scimoz)) !== 'final' && _ref4 !== 'abstract' && _ref4 !== 'class') {
              continue;
            }
            _ref5 = [position, position], scimoz.currentPos = _ref5[0], scimoz.anchor = _ref5[1];
            $support.walk(scimoz, 'before', [['SSL_DEFAULT']], {
              keep: true
            });
            classFound = true;
            break;
          }
          if ((_ref6 = $support.under(scimoz)) !== 'final' && _ref6 !== 'abstract' && _ref6 !== 'class') {
            continue;
          }
          if (!$support.walk(scimoz, 'after', [['\\', 'SSL_IDENTIFIER', 'SSL_WORD', 'SSL_DEFAULT'], ['{', 'SSL_DEFAULT']])) {
            continue;
          }
          $support.walk(scimoz, 'before', [['SSL_DEFAULT']], {
            keep: true
          });
          classFound = true;
          break;
        } finally {
          if (!classFound) {
            _ref7 = [position, anchor], scimoz.currentPos = _ref7[0], scimoz.anchor = _ref7[1];
          }
        }
      }
      if (!classFound) {
        throw Error(strings.GetStringFromName('PHP.error.classNotFound'));
      }
      $support.jumpOpposite();
      $support.before(scimoz).before(scimoz);
      $support.walk(scimoz, 'before', [['SSL_DEFAULT']]);
      return $support.insert("\n\n[[%tabstop1:public]] function [[%tabstop2:" + options.identifier + "]]()\n{\n\t[[%tabstop0]]\n}");
    }
  };
}).call(this);
