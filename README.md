# Super Simple Blog

# Quickstart

1) [optional] Fork the repository.
    It's open source, feel free to make make changes. Or to skip this step, it's up to you
2) clone the repository.
    If you _didn't_ fork, then `git clone git@github.com:kncept/super-simple-blog.git` will work.
3) Copy the 'prod.env.template' to 'prod.env', and update values as required.
    The minimum set to update is:
    `FRONTEND_ENDPOINT` The front end URL that you want to use
    `REACT_APP_API_ENDPOINT` The back end URL that you want to use (TODO: blang ==> API. handling)
    `ADMIN_USER` in a 'provider/email' format. eg: google/email.address@gmail.com
    supported providers are: none
    AWS Key and Secret

    If you wish to also purchase your domain through amazon, set XXXX to true as well
4) Run the deployment orchestrator
    ... gotta build an entrypoint script for this
            build website
            deploy backend

5) Update your name servers to match the AWS domain - UNLESS the domain is AWS Managed (ie you set purchase on in config)

6) Start Posting


