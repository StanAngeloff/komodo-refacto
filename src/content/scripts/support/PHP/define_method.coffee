`const Cc = Components.classes`
`const Ci = Components.interfaces`

$support = ((this.extensions or= {}).refacto or= {}).support or= {}
$support.PHP or= {}

strings = Cc['@mozilla.org/intl/stringbundle;1'].getService(Ci.nsIStringBundleService).createBundle 'chrome://refacto/locale/refacto.properties'

$support.PHP.defineMethod =

  title: strings.GetStringFromName 'PHP.defineMethod'

  canExecute: (scimoz) ->
    # forward past name to ( or possibly the closing )
    return false unless $support.walk scimoz, 'after',  [['SSL_IDENTIFIER', 'SSL_DEFAULT'], ['(', 'SSL_DEFAULT']]
    # rewind operators and whitespace back to the identifier
    return false unless $support.walk scimoz, 'before', [['(', 'SSL_DEFAULT']]
    # eat up whitespace
    $support.walk scimoz, 'after',  [['SSL_DEFAULT']], keep: yes
    # rewind to $this
    return false unless $support.walk scimoz, 'before', [['(', 'SSL_DEFAULT'], ['SSL_IDENTIFIER', 'SSL_DEFAULT'], ['-', '>', 'SSL_DEFAULT'], ['SSL_VARIABLE', 'SSL_DEFAULT']]
    # eat up whitespace
    $support.walk scimoz, 'after',  [['SSL_DEFAULT']], keep: yes
    # ensure we ended up on $this and not $any
    return false unless $support.under(scimoz) is '$this'
    # forward to the method name
    return false unless $support.walk scimoz, 'after', [['SSL_VARIABLE', 'SSL_DEFAULT'], ['-', '>', 'SSL_DEFAULT'], ['SSL_IDENTIFIER', 'SSL_DEFAULT']]
    # eat up whitespace
    $support.walk scimoz, 'before',  [['SSL_DEFAULT']], keep: yes
    { identifier: $support.under scimoz }

  execute: (scimoz, options) ->
    [prevPosition, prevAnchor] = [null, null]
    safeGuard  = 0
    classFound = no
    while ++safeGuard < 20 and (prevPosition isnt scimoz.currentPos or prevAnchor isnt scimoz.anchor)
      [prevPosition, prevAnchor] = [scimoz.currentPos, scimoz.anchor]
      $support.expandBlock()
      [position, anchor] = [scimoz.currentPos, scimoz.anchor]
      try
        # rewind to `[final] class identifier [extends | implements]` and place cursor on {
        before = $support.walk scimoz, 'before', [['{', 'SSL_DEFAULT'], ['\\', 'SSL_IDENTIFIER', 'SSL_WORD', 'SSL_DEFAULT']]
        if before
          $support.walk scimoz, 'after', [['SSL_DEFAULT']], keep: yes
          # ensure we ended up on `class`
          continue unless $support.under(scimoz) in ['final', 'abstract', 'class']
          [scimoz.currentPos, scimoz.anchor] = [position, position]
          # eat up whitespace and place cursor on {
          $support.walk scimoz, 'before', [['SSL_DEFAULT']], keep: yes
          classFound = yes
          break
        # forward expansion after `class`
        continue unless $support.under(scimoz) in ['final', 'abstract', 'class']
        # forward to last whitespace after the opening {
        continue unless $support.walk scimoz, 'after', [['\\', 'SSL_IDENTIFIER', 'SSL_WORD', 'SSL_DEFAULT'], ['{', 'SSL_DEFAULT']]
        # eat up whitespace and place cursor on {
        $support.walk scimoz, 'before', [['SSL_DEFAULT']], keep: yes
        classFound = true
        break
      finally
        [scimoz.currentPos, scimoz.anchor] = [position, anchor] unless classFound
    throw Error strings.GetStringFromName 'PHP.error.classNotFound' unless classFound
    $support.jumpOpposite()
    $support.before(scimoz).before(scimoz)
    $support.walk scimoz, 'before', [['SSL_DEFAULT']]
    $support.insert "\n\n[[%tabstop1:public]] function [[%tabstop2:#{options.identifier}]]()\n{\n\t[[%tabstop0]]\n}"
