(function() {
  var $support, _base, _base2;
  var __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  $support = (_base = ((_base2 = (this.extensions || (this.extensions = {}))).refacto || (_base2.refacto = {}))).support || (_base.support = {});
  $support.walk = function(scimoz, direction, expected, options) {
    var _i, _len, _ref, _ref2, _result, accepted, position, prevPosition, type;
    options || (options = {});
    position = Math.min(scimoz.currentPos, scimoz.anchor);
    while (expected.length) {
      accepted = ((function() {
        _ref = expected.shift();
        _result = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          type = _ref[_i];
          _result.push((type.length > 3 ? scimoz["SCE_UDL_" + type] : type));
        }
        return _result;
      })());
      prevPosition = position;
      while ((_ref = scimoz.getStyleAt(position), __indexOf.call(accepted, _ref) >= 0) || (_ref2 = scimoz.getWCharAt(position), __indexOf.call(accepted, _ref2) >= 0)) {
        position = direction === 'before' ? scimoz.positionBefore(position) : scimoz.positionAfter(position);
        if (position === prevPosition) {
          return false;
        }
      }
      if (position === prevPosition) {
        return false;
      }
    }
    if (expected.length) {
      return false;
    }
    if (options.keep) {
      scimoz.currentPos = scimoz.anchor = position;
    } else {
      scimoz.currentPos = scimoz.anchor = direction === 'before' ? scimoz.positionAfter(position) : scimoz.positionBefore(position);
    }
    return true;
  };
  $support.under = function(scimoz) {
    return scimoz.getTextRange(scimoz.wordStartPosition(scimoz.currentPos, true), scimoz.wordEndPosition(scimoz.currentPos, true));
  };
  $support.expandBlock = function() {
    ko.commands.doCommand('cmd_blockSelect');
    return $support;
  };
  $support.jumpOpposite = function() {
    ko.commands.doCommand('cmd_jumpToMatchingBrace');
    return $support;
  };
  $support.insert = function(value) {
    ko.projects.snippetInsert({
      value: value,
      type: 'snippet',
      name: 'Refacto',
      set_selection: 'true',
      indent_relative: 'true',
      hasAttribute: function(name) {
        return name in this;
      },
      getStringAttribute: function(name) {
        return "" + this[name];
      },
      setStringAttribute: function(name, value) {
        return this[name] = "" + value;
      },
      removeAttribute: function(name) {
        return name in this ? delete this[name] : undefined;
      }
    });
    return $support;
  };
  $support.move = function(scimoz, direction) {
    scimoz.currentPos = scimoz.anchor = direction === 'before' ? scimoz.positionBefore(scimoz.currentPos) : scimoz.positionAfter(scimoz.currentPos);
    return $support;
  };
  $support.after = function(scimoz) {
    return $support.move(scimoz, 'after');
  };
  $support.before = function(scimoz) {
    return $support.move(scimoz, 'before');
  };
}).call(this);
