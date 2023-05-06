# Super Simple Blog

What's super simple about the super simple blog?

* Super Simple to get started
    Just follow the Quickstart to first post.
* Super Simple to host
    Self hosted with scope for increased (or decreased) load, 
* Super Simple to keep
    As an open source project, you can use it, fork it and even change it.


## Quickstart

1) Clone the Repository.
    Feel free to fork it first, and make any changes you need. 
    Otherwise, `git clone git@github.com:kncept/super-simple-blog.git` will work.

2) Open the project
    It is strongly suggested that you use VSCode with DevContainers, as that will give you a full
    development environment with all tools and utilities installed, requiring only Docker and VSCode installed 
    on your system.
    Otherwise, the dockerfile forms the instructions for required environment setup.

3) Copy the 'prod.env.template' to 'prod.env', and fill in any blank properties
    `ADMIN_USER` in a 'provider/email' format. eg: google/email.address@gmail.com
    `PUBLIC_URL` The front end URL that you want to use
    `REACT_APP_API_ENDPOINT` The back end URL that you want to use
    `AWS_ACCESS_KEY_ID`
    `AWS_SECRET_ACCESS_KEY`
    `AWS_DEFAULT_REGION` AWS CLI Credentials (pre setup)

4) `./run.ts deploy`
    If you are not running in the devcontainer, you may need to run the above via `ts-node`.

5) Update your name servers to match the AWS domain - UNLESS the domain is AWS Managed (ie you set purchase on in config)

6) Start Posting

## Developing
Use the run.ts command to make things work.

In the dev container, 
`./run.ts start` will start up the the stack in dev mode
`./run.ts deploy` will build and deploy the stack

If you are NOT using a dev container, then you will need to us ts-node.
`ts-node run.ts start` and `ts-node run.ts deploy` are the equivalent commands
