#!/usr/bin/bash
set -euo pipefail

#should be run.ts rather than run.sh

help() {
    cat << EOF
    Usage:
        help:   prints this message
        start:  starts the stack in dev mode
        deploy: builds and deploys the stack
EOF
}

# start will start the backend and frontend dev servers
start() {
    # start backend
    pushd .
    cd backend
    npm i
    npm run dev &
    BACKEND_PID=$!
    trap "kill ${BACKEND_PID}" INT
    popd

    # start frontend
    pushd .
    cd frontend
    npm i
    npm start &
    FRONTEND_PID=$!
    trap "kill ${FRONTEND_PID}" INT
    popd

    # wait for pids
    wait ${BACKEND_PID}
    wait ${FRONTEND_PID}
}

deploy() {
    # build frontend
    pushd .
    cd frontend
    npm i
    npm run build
    popd

    pushd .
    cd backend
    npm i
    npm run cdk deploy
    popd
}

if [ $# -eq 0 ]; then
    echo "No args supplied - please include a command"
    help
    exit 1
fi

if [ $# -gt 1 ]; then
    echo "Too many args supplied - keep it simple please"
    help
    exit 1
fi

case $1 in
    help)
        help
    ;;
    start)
        start
    ;;
    deploy)
        deploy
    ;;
    *)
        echo Unknown arg: $1
        help
    ;;
esac

