#!/bin/bash

DOCKER_PACKAGE_JSON="package.json"
DOCKER_IMAGE=$(grep '"name"' $DOCKER_PACKAGE_JSON | awk -F ': ' '{print $2}' | tr -d '",')
DOCKER_VERSION=$(grep '"version"' $DOCKER_PACKAGE_JSON | awk -F ': ' '{print $2}' | tr -d '",')
DOCKER_CONTAINER="coding-doodle-manage"

start() {
    docker ps -a | grep $DOCKER_CONTAINER >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "$DOCKER_CONTAINER exists."
    else
        docker run -itd \
            -p 5173:5173 \
            --name $DOCKER_CONTAINER \
            --net host \
            $DOCKER_IMAGE:$DOCKER_VERSION
    fi
}

stop() {
    docker ps -a | grep $DOCKER_CONTAINER >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "$DOCKER_CONTAINER does not exists."
    else
        docker rm -f $DOCKER_CONTAINER
    fi
}

restart() {
    stop
    start
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    *)
        echo "Usage: $0 start|stop|restart" >&2
        exit 1
esac
