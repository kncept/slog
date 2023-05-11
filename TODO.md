
* github Actions


* Add a pluggable persistence layer, so that in memory stuff works
  Also postgres - pluggable into dev and auto-plugged (if not manually configured) into prod

* work out login/sso/oauth/oidc details.
==> provider setup links
 - none - need to handle no login nicely ()
 - google - https://developers.google.com/identity/openid-connect/openid-connect
 - github - https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app

* online 'new post'
  including a 'media upload' (pics, etc)

* versioning, so that initial dev and further 

* post privacy - per post
  only show first content fragment
  Require signin for the remainder

* tsconfig to get rid of any semicolons. ugh

* Auto encrypt/decrypt (from env property 'ANSIBLE_VAULT_PASSWORD')
  using a $DIRECTIVE; directive, tied to $ANSIBLE_VAULT

