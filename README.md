# Super Simple Blog

What's super simple about the super simple blog?

* Super Simple to get started
   * Just follow the Quickstart to first post
   * Only two external dependencies - AWS, and an OIDC provider
* Super Simple to host
    * Default self hosting cloud infrastructure is essentially maintainence free
* Super Simple to keep
    * As an open source project, you can use it, fork it and even change it
    * All data is hosted on your own managed infrastructure


## Quickstart

N.B. for any `run.ts` commands, if you are *NOT* running in a devcontainer, you may need to prefix the command with `ts-node `.

1) Clone the Repository.
    Feel free to fork it first, and make any changes you need. 
    Otherwise, `git clone git@github.com:kncept/super-simple-blog.git` will work.

2) Open the project
    It is strongly suggested that you use VSCode with DevContainers, as that will give you a full
    development environment with all tools and utilities installed, requiring only Docker and VSCode installed 
    on your system.<br/>
    Otherwise, Use your IDE of choice, the devcontainer dockerfile forms the instructions for required environment setup.

3) Copy the 'prodProperties.ts.template' to 'prodProperties.ts' `cp prodProperties.ts.template prodProperties.ts`, and fill in any blank properties
    * `ADMIN_USER` in a 'provider/email' format. eg: google/email.address@gmail.com
    * `publicUrl` The front end URL that you want to use
    * `reactAppApiEndpoint` The back end URL that you want to use
    * `awsAccessKeyId`
    * `awsSecretAccessKey`
    * `awsSecretAccessKey` AWS CLI Credentials (See AWS Documentation if this is not already set up)

4) `./run.ts deploy`
    If you are not running in the devcontainer, you may need to run the above via `ts-node`.

5) Update your name servers to match the AWS domain - UNLESS the domain is AWS Managed (ie you set purchase on in config - still todo)

6) Start Posting

## Developing
Use the run.ts command to make things work.

In the dev container, 
`./run.ts start` will start up the the stack in dev mode
`./run.ts deploy` will build and deploy the stack

If you are NOT using a dev container, then you will need to us ts-node.
`ts-node run.ts start` and `ts-node run.ts deploy` are the equivalent commands


## Fork Customisation

`cp devProperties.ts.template devProperties.ts` ==> Support for checked in dev properties