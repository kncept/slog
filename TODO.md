
# TODO

# In Progress

Create Usermanager to allow renaming via slog.
Capture some data for (Admin) and for (Author).
i.e. 'number of posts' , 'last post date', etc?


# Feature Level TODOs


* Add comments for logged in users
* UserID and a lookup function
  * Deterministic UserID from provider/providerID combo
  * also need a private random seed to ID's are not reverseable


* Tags... author can tag a post with some strings
  Already used strings are displayed to make themes easier
  * (semi) heirarchical... why not - even use the slash character
    Build this into the lookup

* Ability to embed Links for downloading  into current document - referencing that post's metadata

# General TODOs

Three-tier users property.
ADMIN -> can do some site admin stuff (add/remove author privileges)
AUTHOR -> can create and publish drafts
AUTHENTICATED -> can comment

(foldable?) boxes for:
Contributors - with a (remove) option
Media
And make sure that the association is clear.

* Backend needs to be more pluggable.
  * segments: attachment files, posts, keymanager,  userdata
* fix 'storage' and split into clearer domain modules
* Need a way to signal 'not found' as well as 'error'

* Browser Side crtypto to verify JWT tokens ?

* Dates and expiry times in JWTs and cookies

* Landing page to use a bounded initial search

* Update RHS post listing to pull... last 10, including date (!)
* RHS post listing 'pagination' or 'cursor scroll' or something.


* Update 'EDITING' to only allow TITLE and CONTENT updates
* Authors will be auto appended, and media will be auto tracked.
* N.B. This isn't actually synchronzied, but will still be handled by the backend

* work out login/sso/oauth/oidc details.
==> provider setup links
 - none - need to handle no login nicely ()
 - google - https://developers.google.com/identity/openid-connect/openid-connect
 - github - https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app



* post privacy - per post
  only show first content fragment
  Require signin for the remainder

* tsconfig to get rid of any semicolons. ugh

* Auto encrypt/decrypt (from env property 'ANSIBLE_VAULT_PASSWORD')
  using a $DIRECTIVE; directive, tied to $ANSIBLE_VAULT



# Kinda Done, but still here as they need refining:
* draft media to have a tick/cross for 'usage' (and able to be deleted)
* save draft to have a clear -> loading -> tick -> clear cycled (edit based)





New Features:

 - Cross-Post media referencing by post id
 - Display list of attached media
 - Click to add to display
 - Click to remove

Bug Fixes:

 - Client Side auth handling
 - Client Side URL handling
 - API side CORS handling
