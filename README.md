Refactor your code!

![Preview](http://i.imgur.com/omaWc.png)

How to Install (alpha)
======================

Follow the [Firefox extension proxy file](https://developer.mozilla.org/en/Setting_up_extension_development_environment#Firefox_extension_proxy_file) instructions. You can find your XRE/extensions directory path [in the docs](http://docs.activestate.com/komodo/5.0/trouble.html#appdata_dir).

Extension ID: `refacto@psp-webtech.co.uk`

What is working?
================

`<|>` indicates the cursor position when *Alt+Enter* is pressed.

* **PHP**
  * Creating methods from `$this->method<|>Name()`

What is not implemented?
========================

* **PHP**
  * Copy / Move / Rename
  * Introduce type hint for variable
  * Assign return value to a variable
* Support for other languages (this is pluggable, i.e., can be developed as separate add-ons)
