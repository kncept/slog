# S'log

Slog... the Simple Web Log.

* Simple to get started
   * Just follow the Quickstart to first post
   * Only two external dependencies - AWS, and an OIDC provider
* Simple to host
    * Default self hosting cloud infrastructure is essentially maintainence free
* Simple to keep
    * As an open source project, you can use it, fork it and even change it
    * All data is hosted on your own managed infrastructure


## Quickstart

1) Clone the Repository.
    Feel free to fork it first, and make any changes you need. 
    Otherwise, `git clone git@github.com:kncept/slog.git` will work.

2) Open the project
    It is strongly suggested that you use the provided DevContainer, as that will give you a full
    development environment with all tools and utilities installed, requiring only Docker and VSCode installed 
    on your system.<br/>
    Otherwise, Use your IDE of choice, the devcontainer dockerfile forms the instructions for required environment setup.<br/>
    The only dependencies should be npm, node, and ts-node.

3) Copy the 'prodProperties.ts.template' to 'prodProperties.ts' `cp prodProperties.ts.template prodProperties.ts`, and fill in any blank properties

    The minimum set required should be:
    * `adminUsers` an array in a 'provider/email' format. eg: `['google/email.address@gmail.com', 'GitHub:kncept']`
    * `publicUrl` The front end URL that you want to use
    * `reactAppApiEndpoint` The back end URL that you want to use
    * `awsAccessKeyId`
    * `awsSecretAccessKey`
    * `awsSecretAccessKey` AWS CLI Credentials (See AWS Documentation if this is not already set up)

4) `./run.ts deploy`
    If you are not running in the devcontainer, you may need to run the above via `ts-node`.
    This will create a Cloudformation stack via the AWS CDK.
    Everything is in one stack (`SLog` by default), but uses multiple nested stacks to deploy.

5) Update your name servers to match the AWS domain - UNLESS the domain is AWS Managed (ie you set purchase on in config - still todo)

6) Start Posting


## Developing
All orchestration is done by the run.ts command. This uses ts-node

In the dev container, 
`./run.ts start` will start up the the stack in dev mode
`./run.ts deploy` will build and deploy the stack
`./run.ts test` will run all unit tests


## Current Constraints
  * Backend and Frontend need to be on the same top level hosted domain
  * CORS isn't locked down properly


## Fork Customisation

`cp devProperties.ts.template devProperties.ts` ==> Support for checked in dev properties

If you want to commit secrets, I would suggest using the `https://github.com/commenthol/ansible-vault` library.


## Auth Provider Configuration

Help for some basic auth providers.<br/>
Currently only OIDC is supported.

### OIDC providers:

* Kncept
  * Fork the repo, deploy, and use the URLs
  * Not a real solution yet
  * https://github.com/kncept-oauth/simple-oidc

### Oauth (not OIDC) providers

* Github
  * https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app
  *  Only Oauth.. c'mon Microsoft, you can do better

* Facebook
  * Not an OIDC provider. sigh.
  * https://developers.facebook.com/apps

