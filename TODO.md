


* Landing page to use a bounded initial search

* Update RHS post listing to pull... last 10, including date (!)
* RHS post listing 'pagination' or 'cursor scroll' or something.

* draft media to have a tick/cross for 'usage' (and able to be deleted)
* save draft to have a clear -> loading -> tick -> clear cycled (edit based)

* Update 'EDITING' to only allow TITLE and CONTENT updates
* Authors will be auto appended, and media will be auto tracked.
* N.B. This isn't actually synchronzied, but will still be handled by the backend

* work out login/sso/oauth/oidc details.
==> provider setup links
 - none - need to handle no login nicely ()
 - google - https://developers.google.com/identity/openid-connect/openid-connect
 - github - https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app

* fix 'storage' and split into clearer domain modules

* post privacy - per post
  only show first content fragment
  Require signin for the remainder

* tsconfig to get rid of any semicolons. ugh

* Auto encrypt/decrypt (from env property 'ANSIBLE_VAULT_PASSWORD')
  using a $DIRECTIVE; directive, tied to $ANSIBLE_VAULT

* Allow Frontend and Backend to be in different domain names (top level domain name stuff)

