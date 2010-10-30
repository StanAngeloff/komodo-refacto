`const Cc = Components.classes`
`const Ci = Components.interfaces`

`const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'`

`const DEFAULT_KEY_BINDING = 'Alt+Return'`

$support = ((this.extensions or= {}).refacto or= {}).support or= {}

strings = Cc['@mozilla.org/intl/stringbundle;1'].getService(Ci.nsIStringBundleService).createBundle 'chrome://refacto/locale/refacto.properties'


this.extensions.refacto.Refacto = class Refacto

  constructor: ->
    return new Refacto arguments... if this not instanceof Refacto
    @assignDefaultKey()

  assignDefaultKey: ->
    isMac = ~navigator.platform.indexOf 'Mac'
    try
      existingKeyBindings = gKeybindingMgr.command2keysequences commandName = 'cmd_refacto_triggerAtPosition'
      unless existingKeyBindings.length
        keySequence = DEFAULT_KEY_BINDING
        keySequence = keySequence.replace /\bCtrl\b/g, 'Meta' if isMac
        keySequence = keySequence.split(',').map (key) -> key.replace /^\s+|\s+$/, ''
        usedBy      = gKeybindingMgr.usedBy keySequence
        if not usedBy.length or (usedBy.length is 1 and usedBy[0].command is 'cmd_editProperties')
          gKeybindingMgr.clearBinding usedBy[0].command if usedBy.length
          gKeybindingMgr.assignKey commandName, keySequence
          gKeybindingMgr.makeKeyActive commandName, keySequence
    catch error
      ko.dialogs.alert strings.GetStringFromName('uncaughtError'), error.toString()
    undefined

  @showAvailable: (view, features, menu) ->
    features.map (feature) ->
      feature.title = feature.title.replace /\$\{(\w+)\}/g, (match, key) -> feature.options[key]
    features.sort (left, right) ->
      return -1 if left.title < right.title
      return  1 if left.title > right.title
      return  0
    menu or= {}
    if menu.parent
      menu.parent.removeAttribute 'disabled'
    unless menu.element
      menu.element = document.getElementById menu.id = 'refacto_features_menu'
      unless menu.element
        menu.element = document.createElementNS XUL_NS, 'menupopup'
        menu.element.id = menu.id
        document.documentElement.appendChild menu.element
    menu.element.removeChild menu.element.firstChild while menu.element.firstChild
    scimoz = view.scimoz
    for feature, index in features then ((feature, index) ->
      itemElement = document.createElementNS XUL_NS, 'menuitem'
      if index < 9
        itemAccessKey = index + 1
      else if index is 9
        itemAccessKey = 0
      else
        itemAccessKey = String.fromCharCode 'A'.charCodeAt(0) + (index - 9)
      itemElement.setAttribute 'class', 'menuitem-iconic refacto-feature'
      itemElement.setAttribute 'label', feature.title
      itemElement.setAttribute 'accesskey', itemAccessKey
      itemElement.addEventListener 'command', ->
        view.setFocus()
        try
          scimoz.beginUndoAction()
          feature.klass.execute scimoz, feature.options
        catch error
          ko.dialogs.alert strings.GetStringFromName('uncaughtError'), error.toString()
        finally
          scimoz.endUndoAction()
      , false
      menu.element.appendChild itemElement
    )(feature, index)
    unless menu.visible
      menuAnchor   = Math.min scimoz.anchor, scimoz.currentPos
      menuPosition = Math.max scimoz.anchor, scimoz.currentPos
      menu.element.openPopupAtScreen \
          view.boxObject.screenX + scimoz.pointXFromPosition(menuAnchor) - 1
        , view.boxObject.screenY + scimoz.pointYFromPosition(menuPosition) + scimoz.textHeight(scimoz.lineFromPosition(menuPosition) - 1)
        , yes
      window.setTimeout ->
        event = document.createEvent 'KeyEvents'
        event.initKeyEvent type = 'keypress', bubbles = no, cancelable = no, viewArg = null, no, no, no, no, KeyEvent.DOM_VK_DOWN, null
        menu.element.dispatchEvent event
      , 125
    undefined

  @triggerAtPosition: (menu) ->
    exit = (result) ->
      if menu?.parent
        menu.parent.setAttribute 'disabled', yes
      else
        ko.statusBar.AddMessage strings.GetStringFromName('noFeaturesAvailable'), 'htmltoolkit', 2500, true
      result
    return exit false unless view = ko.views.manager?.currentView
    return exit false unless view.getAttribute('type') is 'editor'
    return exit false unless (document = view.document) and (scimoz = view.scimoz)
    features = []
    for language in [document.language].concat(if document.language is document.subLanguage then [] else [document.subLanguage])
      continue unless $support[language]
      for feature, klass of $support[language]
        try
          options = {}
          [prevPosition, prevAnchor] = [scimoz.currentPos, scimoz.anchor]
          continue unless options = klass.canExecute scimoz
          break if options is '__debug__'
        finally
          [scimoz.currentPos, scimoz.anchor] = [prevPosition, prevAnchor] unless options is '__debug__'
        features.push { klass, title: klass.title, options }
    unless features.length
      return exit false
    Refacto.showAvailable view, features, menu
