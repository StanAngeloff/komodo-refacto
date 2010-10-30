$support = ((this.extensions or= {}).refacto or= {}).support or= {}

$support.walk = (scimoz, direction, expected, options) ->
  options or= {}
  position  = Math.min scimoz.currentPos, scimoz.anchor
  while expected.length
    accepted     = ((if type.length > 3 then scimoz["SCE_UDL_#{type}"] else type) for type in expected.shift())
    prevPosition = position
    while (scimoz.getStyleAt(position) in accepted) or (scimoz.getWCharAt(position) in accepted)
      position = if direction is 'before' then scimoz.positionBefore position else scimoz.positionAfter position
      return false if position is prevPosition
    return false if position is prevPosition
  return false if expected.length
  if options.keep
    scimoz.currentPos = scimoz.anchor = position
  else
    scimoz.currentPos = scimoz.anchor = if direction is 'before' then scimoz.positionAfter position else scimoz.positionBefore position
  return true

$support.under = (scimoz) ->
  scimoz.getTextRange scimoz.wordStartPosition(scimoz.currentPos, true), scimoz.wordEndPosition(scimoz.currentPos, true)

$support.expandBlock  = -> ko.commands.doCommand 'cmd_blockSelect'; $support
$support.jumpOpposite = -> ko.commands.doCommand 'cmd_jumpToMatchingBrace'; $support

$support.insert = (value) ->
  ko.projects.snippetInsert
    value:              value
    type:               'snippet'
    name:               'Refacto'
    set_selection:      'true'
    indent_relative:    'true'
    hasAttribute:       (name)        -> name of this
    getStringAttribute: (name)        -> "#{@[name]}"
    setStringAttribute: (name, value) -> @[name] = "#{value}"
    removeAttribute:    (name)        -> delete @[name] if name of this
   $support

$support.move = (scimoz, direction) ->
  scimoz.currentPos = scimoz.anchor = if direction is 'before' then scimoz.positionBefore scimoz.currentPos else scimoz.positionAfter scimoz.currentPos
  $support

$support.after  = (scimoz) -> $support.move scimoz, 'after'
$support.before = (scimoz) -> $support.move scimoz, 'before'
