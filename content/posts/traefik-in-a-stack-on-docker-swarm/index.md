---
title: "Traefik in a stack on Docker Swarm"
description: "Recently at work I used Traefik as the loadbalancer and some kind of api gateway in a stack on Docker Swarm. This post should provide you a short overview how I implemented and configured Traefik"
tags:
  - docker
  - docker-compose
  - swarm
  - traefik
categories:
  - traefik
date: 2022-01-31T20:35:28+01:00
draft: false
---

For the last project at work I used Traefik as the entrypoint for the whole stack on Docker. It totally would make sense to use an api gateway in this case but Traefik does the job quite nice and is easy to spin up within the stack. This is the reason why I wrote this article to show you how Traefik is configured in this scenario.

## Overview

This is a simple overview of the stack (created with [Excalidraw](https://excalidraw.com/)).
![Service overview](images/service_overview.png "Simple service overview")
Three services are customer faced (green arrows) and one is only reachable within the stack (orange arrows). The internally reachable service is used to check if the given app token on each request of an user is valid. Yes, nearly every endpoint is protected by an app token.
Traefik publishes each cutstomer faced service based on a path prefix to provide a central entrypoint for any user/service that wants to consume a service.

## Example Traefik config

The following YAML file is an example `docker-compose.yml` file which can directly be used to deploy a stack on a Swarm.

```yaml
---
version: "3.8"
services:
  traefik:
    image: traefik
    command:
      - "--log.level=ERROR"
      - "--providers.docker=true"
      - "--providers.docker.swarmMode=true"
      - "--providers.docker.exposedByDefault=false"
      - "--providers.docker.network=my-services"
      - "--entrypoints.web.address=:8001"
    ports:
      - 80:8001
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    deploy:
      placement:
        constraints:
          - "node.role==manager"

  service-a:
    image: traefik/whoami
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.servicea.rule=PathPrefix(`/endpoint/a`)"
        - "traefik.http.routers.servicea.entrypoints=web"
        - "traefik.http.services.servicea.loadbalancer.server.port=80"
      replicas: 1

  service-b:
    image: traefik/whoami
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.serviceb.rule=PathPrefix(`/endpoint/b`)"
        - "traefik.http.routers.serviceb.entrypoints=web"
        - "traefik.http.services.serviceb.loadbalancer.server.port=80"
      replicas: 1

  service-c:
    image: traefik/whoami
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.servicec.rule=PathPrefix(`/endpoint/c`)"
        - "traefik.http.routers.servicec.entrypoints=web"
        - "traefik.http.services.servicec.loadbalancer.server.port=80"
      replicas: 1

  internal-service:
    image: traefik/whoami

networks:
  default:
    name: my-services
```

For this example I simply used the [traefik/whoami](https://hub.docker.com/r/traefik/whoami) image. This image will print out all information that were send in the Request, we just need something to differentiate the services.
To explain each service I will split this file up and comment each interesting line.

### Traefik

```yaml
traefik:
  image: traefik
  command:
    - "--log.level=ERROR"
    # Enable the Docker provide and tell Traefik it runs within a Swarm (mandatory)
    - "--providers.docker=true"
    - "--providers.docker.swarmMode=true"
    # We don't want to expose every service
    - "--providers.docker.exposedByDefault=false"
    # The Docker network where the services are connected to
    - "--providers.docker.network=my-services"
    # Define a entrypoint named "web" and bind it to port 8001 (mandatory)
    - "--entrypoints.web.address=:8001"
  ports:
    - 80:8001
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
  # If Traefik doesn't run on the manager only the service that run on the same
  # node will be discovered
  deploy:
    placement:
      constraints:
        - "node.role==manager"
```

### The services

```yaml
service-a:
  image: traefik/whoami
  deploy:
    labels:
      # This service should be published through Traefik
      - "traefik.enable=true"
      # To reach this service the URI has to begin with /endpoint/a
      - "traefik.http.routers.servicea.rule=PathPrefix(`/endpoint/a`)"
      # The service will be bound to the entrypoint web which was defined earlier
      - "traefik.http.routers.servicea.entrypoints=web"
      # The published port on this service
      - "traefik.http.services.servicea.loadbalancer.server.port=80"
    replicas: 1
```

### The network

```yaml
# The network will be defined as default and in this way connected to each defined service
networks:
  default:
    name: my-services
```

## Deploy

To deploy this stack simply execute `docker stack deploy --compose-file docker-compose.yml my-stack`. After this command is executed you should see something similar by running `docker stack ls`

```text
NAME                SERVICES            ORCHESTRATOR
my-stack            5                   Swarm
```

To list every service on the Swarm execute `docker service ls`.

```text
ID                  NAME                                   MODE                REPLICAS            IMAGE                        PORTS
xxxxxxxxxxxx        my-stack_service-a                     replicated          1/1                 traefik/whoami
xxxxxxxxxxxx        my-stack_service-b                     replicated          1/1                 traefik/whoami
xxxxxxxxxxxx        my-stack_service-c                     replicated          1/1                 traefik/whoami
xxxxxxxxxxxx        my-stack_internal-service              replicated          1/1                 traefik/whoami
xxxxxxxxxxxx        my-stack_traefik                       replicated          1/1                 traefik:latest               *:80->8001/tcp
```

Hop into you browser and try to reach each service (if you deployed it locally)

- [http://localhost/endpoint/a](http://localhost/endpoint/a)
- [http://localhost/endpoint/b](http://localhost/endpoint/b)
- [http://localhost/endpoint/c](http://localhost/endpoint/c)

For each url you should see a different result which indicates that everything works correctly.
As already mentioned in the beginning of this post. Normally you would use something like an api gateway but I think Traefik is a simple and easy to integrate solution for a small stack like this.
Small, because the complexity and rules are very simple and we don't expect that much traffic (we will see, if this will be the case).

I hope this article helps you in any way 🙂
