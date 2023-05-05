# Super Simple Blog

What's super simple about the super simple blog?
It's easy and quick to get up and running, and to make your first post.

## Quickstart

1) Clone the Repository.
    Feel free to fork it first, and make any changes you need. 
    Otherwise, `git clone git@github.com:kncept/super-simple-blog.git` will work.

2) Copy the 'prod.env.template' to 'prod.env', and fill in any blank properties
    `ADMIN_USER` in a 'provider/email' format. eg: google/email.address@gmail.com
    `PUBLIC_URL` The front end URL that you want to use
    `REACT_APP_API_ENDPOINT` The back end URL that you want to use
    `AWS_ACCESS_KEY_ID`
    `AWS_SECRET_ACCESS_KEY`
    `AWS_DEFAULT_REGION` AWS CLI Credentials (pre setup)

3) Run `./run.sh deploy`

4) Update your name servers to match the AWS domain - UNLESS the domain is AWS Managed (ie you set purchase on in config)

5) Start Posting

## Developing
Use the run.sh command to make things work.

`./run.sh start` will start up the the stack in dev mode
`./run.sh deploy` will build and deploy the stack

